import React, { useState, useEffect } from 'react';
import { AudioEngine } from '../services/audio/AudioEngine';

interface SynthesizerSettingsProps {
  audioEngine: AudioEngine;
}

const SynthesizerSettings: React.FC<SynthesizerSettingsProps> = ({ audioEngine }) => {
  const [oscillatorType, setOscillatorType] = useState(audioEngine.getOscillatorType());
  const [amplitudeMultiplier, setAmplitudeMultiplier] = useState(audioEngine.getAmplitudeMultiplier());
  const [attackTime, setAttackTime] = useState(audioEngine.getAttackTime());
  const [decayTime, setDelayTime] = useState(audioEngine.getDelayTime());
  const [releaseTime, setReleaseTime] = useState(audioEngine.getReleaseTime());
  const [sustainGain, setSustainGain] = useState(audioEngine.getSustainGain());
  const [silenceGain, setSilenceGain] = useState(audioEngine.getSilenceGain());

  useEffect(() => {
    audioEngine.setOscillatorType(oscillatorType);
  }, [oscillatorType, audioEngine]);

  useEffect(() => {
    audioEngine.setAmplitudeMultiplier(amplitudeMultiplier);
  }, [amplitudeMultiplier, audioEngine]);

  useEffect(() => {
    audioEngine.setAttackTime(attackTime);
  }, [attackTime, audioEngine]);

  useEffect(() => {
    audioEngine.setDelayTime(decayTime);
  }, [decayTime, audioEngine]);

  useEffect(() => {
    audioEngine.setReleaseTime(releaseTime);
  }, [releaseTime, audioEngine]);

  useEffect(() => {
    audioEngine.setSustainGain(sustainGain);
  }, [sustainGain, audioEngine]);

  useEffect(() => {
    audioEngine.setSilenceGain(silenceGain);
  }, [silenceGain, audioEngine]);

  return (
    <div className="w-full sm:w-auto p-5 rounded-3xl border border-slate-700/50 shadow-xl shadow-slate-950/20 backdrop-blur-sm">
      <div className="mb-4 flex flex-col gap-3">
        <div className="space-y-2">
          <select
            value={oscillatorType}
            onChange={(e) => setOscillatorType(e.target.value as OscillatorType)}
            className="
              w-full rounded-2xl border border-slate-700 px-3 py-2
              focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/25
              dark:bg-slate-800/70 dark:text-slate-100
            "
          >
            <option value="sine">正弦波</option>
            <option value="square">方波</option>
            <option value="sawtooth">锯齿波</option>
            <option value="triangle">三角波</option>
          </select>
        </div>
      </div>

      <div className="mb-4 pb-1 rounded-2xl border border-slate-700/50 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span>音量系数</span>
          <span className="font-semibold">{amplitudeMultiplier.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={amplitudeMultiplier}
          onChange={(e) => setAmplitudeMultiplier(parseFloat(e.target.value))}
          className="w-full accent-indigo-400"
        />
      </div>

      <div className="mb-4 pb-1 rounded-2xl border border-slate-700/50 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span>起音时间</span>
          <span className="font-semibold">{attackTime.toFixed(3)} s</span>
        </div>
        <input
          type="range"
          min="0.001"
          max="0.1"
          step="0.001"
          value={attackTime}
          onChange={(e) => setAttackTime(parseFloat(e.target.value))}
          className="w-full accent-indigo-400"
        />
      </div>

      <div className="mb-4 pb-1 rounded-2xl border border-slate-700/50 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span>衰音时间</span>
          <span className="font-semibold">{decayTime.toFixed(2)} s</span>
        </div>
        <input
          type="range"
          min="0.01"
          max="1"
          step="0.01"
          value={decayTime}
          onChange={(e) => setDelayTime(parseFloat(e.target.value))}
          className="w-full accent-indigo-400"
        />
      </div>

      <div className="mb-4 pb-1 rounded-2xl border border-slate-700/50 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span>释音时间</span>
          <span className="font-semibold">{releaseTime.toFixed(2)} s</span>
        </div>
        <input
          type="range"
          min="0.01"
          max="1"
          step="0.01"
          value={releaseTime}
          onChange={(e) => setReleaseTime(parseFloat(e.target.value))}
          className="w-full accent-indigo-400"
        />
      </div>

      <div className="mb-4 pb-1 rounded-2xl border border-slate-700/50 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span>稳音增益</span>
          <span className="font-semibold">{sustainGain.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.01"
          value={sustainGain}
          onChange={(e) => setSustainGain(parseFloat(e.target.value))}
          className="w-full accent-indigo-400"
        />
      </div>

      <div className="mb-4 pb-1 rounded-2xl border border-slate-700/50 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span>静音增益</span>
          <span className="font-semibold">{silenceGain.toExponential(2)}</span>
        </div>
        <input
          type="range"
          min="0.000001"
          max="0.001"
          step="0.000001"
          value={silenceGain}
          onChange={(e) => setSilenceGain(parseFloat(e.target.value))}
          className="w-full accent-indigo-400"
        />
      </div>
    </div>
  );
};

export default SynthesizerSettings;