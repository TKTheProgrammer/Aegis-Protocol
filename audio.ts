import { PlayerMode } from './types';

export class AudioSystem {
  ctx: AudioContext;
  masterGain: GainNode;
  
  // Mix Buses
  mechBus: GainNode;
  pilotBus: GainNode;
  sfxBus: GainNode;
  
  // State
  isPlaying: boolean = false;
  currentMode: PlayerMode = PlayerMode.MECH;
  intensity: number = 0; // 0 to 1 (Danger level)
  
  // Sequencer
  nextNoteTime: number = 0;
  current16th: number = 0;
  tempo: number = 110;
  lookahead: number = 25.0; // ms
  scheduleAheadTime: number = 0.1; // s
  timerID: number | null = null;

  constructor() {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContext();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.4; // Master volume
    this.masterGain.connect(this.ctx.destination);

    // Create Mix Buses
    this.mechBus = this.ctx.createGain();
    this.mechBus.connect(this.masterGain);
    
    this.pilotBus = this.ctx.createGain();
    this.pilotBus.connect(this.masterGain);

    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = 0.7;
    this.sfxBus.connect(this.masterGain);

    // Initial Mix
    this.mechBus.gain.value = 1;
    this.pilotBus.gain.value = 0;
  }

  start() {
    if (this.isPlaying) return;
    
    // Resume context if suspended (browser policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.nextNoteTime = this.ctx.currentTime;
    this.scheduler();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerID) window.clearTimeout(this.timerID);
  }

  update(mode: PlayerMode, distanceToDanger: number) {
    // Determine Intensity (0 = safe, 1 = immediate danger)
    // Distance 0-1000 mapped to 1-0
    const rawIntensity = Math.max(0, 1 - (distanceToDanger / 800));
    // Smooth transition
    this.intensity += (rawIntensity - this.intensity) * 0.1;
    
    // Crossfade Logic
    const fadeSpeed = 0.05;
    const targetMechVol = mode === PlayerMode.MECH ? 1.0 : 0.0;
    const targetPilotVol = mode === PlayerMode.PILOT ? 1.0 : 0.0;

    // Linear interpolation for volume to avoid clicks
    const now = this.ctx.currentTime;
    this.mechBus.gain.setTargetAtTime(targetMechVol, now, fadeSpeed);
    this.pilotBus.gain.setTargetAtTime(targetPilotVol, now, fadeSpeed);
    
    this.currentMode = mode;
  }

  // --- SFX METHODS ---

  playShoot() {
     const t = this.ctx.currentTime;
     const osc = this.ctx.createOscillator();
     const gain = this.ctx.createGain();
     osc.connect(gain);
     gain.connect(this.sfxBus);

     osc.type = 'square';
     osc.frequency.setValueAtTime(800, t);
     osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);

     gain.gain.setValueAtTime(0.3, t);
     gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

     osc.start(t);
     osc.stop(t + 0.2);
     
     // Layer noise for kick
     this.playSnare(t, this.sfxBus); 
  }

  playExplosion() {
     const t = this.ctx.currentTime;
     const bufferSize = this.ctx.sampleRate * 1.5; 
     const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
     const data = buffer.getChannelData(0);
     for (let i = 0; i < bufferSize; i++) {
       data[i] = Math.random() * 2 - 1;
     }
     
     const noise = this.ctx.createBufferSource();
     noise.buffer = buffer;
     const filter = this.ctx.createBiquadFilter();
     filter.type = 'lowpass';
     filter.frequency.setValueAtTime(1000, t);
     filter.frequency.exponentialRampToValueAtTime(50, t + 1.0);
     
     const gain = this.ctx.createGain();
     gain.gain.setValueAtTime(1.0, t);
     gain.gain.exponentialRampToValueAtTime(0.01, t + 1.2);

     noise.connect(filter);
     filter.connect(gain);
     gain.connect(this.sfxBus);
     
     noise.start(t);
  }

  playImpact() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.sfxBus);
    
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
    
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.start(t);
    osc.stop(t+0.1);
  }

  playStep() {
     const t = this.ctx.currentTime;
     const osc = this.ctx.createOscillator();
     const gain = this.ctx.createGain();
     osc.connect(gain);
     gain.connect(this.sfxBus);
     
     osc.frequency.setValueAtTime(80, t);
     osc.frequency.exponentialRampToValueAtTime(20, t + 0.15);
     gain.gain.setValueAtTime(0.4, t);
     gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
     
     osc.start(t);
     osc.stop(t+0.15);
  }
  
  playDodge() {
     const t = this.ctx.currentTime;
     const bufferSize = this.ctx.sampleRate * 0.3; 
     const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
     const data = buffer.getChannelData(0);
     for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
     
     const noise = this.ctx.createBufferSource();
     noise.buffer = buffer;
     const filter = this.ctx.createBiquadFilter();
     filter.type = 'bandpass';
     filter.frequency.setValueAtTime(200, t);
     filter.frequency.exponentialRampToValueAtTime(1200, t + 0.2);
     
     const gain = this.ctx.createGain();
     gain.gain.setValueAtTime(0.3, t);
     gain.gain.linearRampToValueAtTime(0, t + 0.3);
     
     noise.connect(filter);
     filter.connect(gain);
     gain.connect(this.sfxBus);
     noise.start(t);
  }

  playEject() {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.sfxBus);
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.3);
      
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.3);
      
      osc.start(t);
      osc.stop(t+0.3);
  }
  
  playMeleeSwing() {
     const t = this.ctx.currentTime;
     const bufferSize = this.ctx.sampleRate * 0.3;
     const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
     const data = buffer.getChannelData(0);
     for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
     
     const noise = this.ctx.createBufferSource();
     noise.buffer = buffer;
     const filter = this.ctx.createBiquadFilter();
     filter.type = 'lowpass';
     filter.frequency.setValueAtTime(100, t);
     filter.frequency.linearRampToValueAtTime(1500, t+0.15);
     
     const gain = this.ctx.createGain();
     gain.gain.setValueAtTime(0.4, t);
     gain.gain.exponentialRampToValueAtTime(0.01, t+0.3);
     
     noise.connect(filter);
     filter.connect(gain);
     gain.connect(this.sfxBus);
     noise.start(t);
  }

  playMeleeHit() {
      const t = this.ctx.currentTime;
      const carrier = this.ctx.createOscillator();
      const modulator = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      const outGain = this.ctx.createGain();
      
      carrier.frequency.value = 200;
      modulator.frequency.value = 345; // Ratio
      modGain.gain.value = 1000;
      
      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(outGain);
      outGain.connect(this.sfxBus);
      
      outGain.gain.setValueAtTime(0.6, t);
      outGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
      
      carrier.start(t);
      modulator.start(t);
      carrier.stop(t + 0.5);
      modulator.stop(t + 0.5);
  }

  // --- SEQUENCER ---
  
  scheduler() {
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.current16th, this.nextNoteTime);
      this.nextStep();
    }
    this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  nextStep() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += 0.25 * secondsPerBeat; // 16th notes
    this.current16th = (this.current16th + 1) % 16;
  }

  scheduleNote(beatNumber: number, time: number) {
    // === MECH TRACK (Industrial / Rhythmic) ===
    
    // KICK: 4/4 driving beat
    if (beatNumber % 4 === 0) {
      this.playKick(time, this.mechBus);
    }

    // BASS: Off-beat driving sawtooth
    if (beatNumber % 2 !== 0) {
      const freq = Math.random() > 0.8 ? 110 : 55; 
      this.playBass(time, freq, this.mechBus);
    }
    
    // HI-HATS
    if (beatNumber % 2 === 0) {
        this.playHiHat(time, 0.3, this.mechBus);
    } else {
        this.playHiHat(time, 0.1, this.mechBus);
    }
    
    // SNARE: Backbeat
    if (beatNumber === 4 || beatNumber === 12) {
       this.playSnare(time, this.mechBus);
    }

    // === PILOT TRACK (Ambient / Horror) ===
    
    // DRONE
    if (beatNumber === 0) {
       this.playDrone(time, this.pilotBus);
    }

    // SONAR
    if (beatNumber % 4 === 0 && Math.random() < 0.3) {
       this.playPing(time, this.pilotBus);
    }

    // HEARTBEAT
    let playHeart = false;
    if (beatNumber === 0) playHeart = true;
    else if (beatNumber === 8 && this.intensity > 0.3) playHeart = true;
    else if ((beatNumber === 4 || beatNumber === 12) && this.intensity > 0.7) playHeart = true;
    else if (beatNumber % 2 === 0 && this.intensity > 0.9) playHeart = true;

    if (playHeart) {
        this.playHeartbeat(time, this.pilotBus);
    }
  }

  // --- SYNTHESIS METHODS ---

  playKick(time: number, output: GainNode) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(output);

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    
    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

    osc.start(time);
    osc.stop(time + 0.5);
  }

  playSnare(time: number, output: GainNode) {
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 1000;
      const noiseGain = this.ctx.createGain();

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(output);

      noiseGain.gain.setValueAtTime(0.4, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
      
      noise.start(time);
  }

  playHiHat(time: number, vol: number, output: GainNode) {
      const bufferSize = this.ctx.sampleRate * 0.1; 
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 7000;
      const gain = this.ctx.createGain();

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(output);

      gain.gain.setValueAtTime(vol * 0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

      noise.start(time);
  }

  playBass(time: number, freq: number, output: GainNode) {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, time);
      filter.frequency.exponentialRampToValueAtTime(800, time + 0.1);
      filter.frequency.exponentialRampToValueAtTime(100, time + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(output);

      gain.gain.setValueAtTime(0.2, time);
      gain.gain.setTargetAtTime(0, time, 0.1);

      osc.start(time);
      osc.stop(time + 0.25);
  }

  playDrone(time: number, output: GainNode) {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      
      osc1.frequency.value = 55; // A1
      osc2.frequency.value = 58; // Detuned

      filter.type = 'lowpass';
      filter.frequency.value = 200 + (this.intensity * 200); 

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(output);

      const length = (60 / this.tempo) * 4;

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.2, time + length * 0.1);
      gain.gain.linearRampToValueAtTime(0, time + length);

      osc1.start(time);
      osc1.stop(time + length);
      osc2.start(time);
      osc2.stop(time + length);
  }

  playPing(time: number, output: GainNode) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 880 * (1 + Math.floor(Math.random() * 3) * 0.5); 

      osc.connect(gain);
      gain.connect(output);

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.1, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 1.5); 

      osc.start(time);
      osc.stop(time + 2.0);
  }

  playHeartbeat(time: number, output: GainNode) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, time);
      osc.frequency.exponentialRampToValueAtTime(10, time + 0.1);

      osc.connect(gain);
      gain.connect(output);

      const vol = 0.2 + (this.intensity * 0.8);
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

      osc.start(time);
      osc.stop(time + 0.2);
  }
}