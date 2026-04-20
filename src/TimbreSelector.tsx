import React, { useState, useEffect } from 'react';
import { type Timbre, AudioEngine } from './AudioEngine';

type Preset = 'ethereal' | 'metallic' | 'normal' | 'custom';

function isPreset(value: string): value is Preset {
  return ['ethereal', 'metallic', 'normal', 'custom'].includes(value);
}

interface TimbreSelectorProps {
  audioEngine: AudioEngine;
  onTimbreChange: (timbre: Timbre) => void;
}

const defaultLambda = 0.5;

const TimbreSelector: React.FC<TimbreSelectorProps> = ({ audioEngine, onTimbreChange }) => {
  const [selectedPreset, setSelectedPreset] = useState<Preset>('normal');
  const [lambda, setLambda] = useState(defaultLambda);
  const [amplitudes, setAmplitudes] = useState<number[]>(() => AudioEngine.generatePresetTimbre('normal', defaultLambda).amplitudes);

  useEffect(() => {
    const timbre: Timbre = {
      name: selectedPreset === 'custom' ? 'Custom' : selectedPreset,
      amplitudes,
    };
    audioEngine.setTimbre(timbre);
    onTimbreChange(timbre);
  }, [selectedPreset, amplitudes, audioEngine, onTimbreChange]);

  const handlePresetChange = (preset: Preset) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      const presetTimbre = AudioEngine.generatePresetTimbre(preset, preset === 'normal' ? lambda : undefined);
      setAmplitudes(presetTimbre.amplitudes);
    }
  };

  const handleLambdaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setLambda(value);
    if (selectedPreset === 'normal') {
      const presetTimbre = AudioEngine.generatePresetTimbre('normal', value);
      setAmplitudes(presetTimbre.amplitudes);
    }
  };

  const handleAmplitudeChange = (index: number, value: number) => {
    setSelectedPreset('custom');
    setAmplitudes((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const harmonicLabels = Array.from({ length: 10 }, (_, index) =>
    <span>
      f<sub>{index + 1}</sub>
    </span>);

  return (
    <div className="w-full sm:w-auto p-5 rounded-3xl border border-slate-700/50 shadow-xl shadow-slate-950/20 backdrop-blur-sm">
      <div className="mb-2 flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">音色调节器</h2>
        <div className="space-y-2">
          <label className="block text-sm font-medium">选择预设或移动按钮</label>
          <select
            value={selectedPreset}
            onChange={(e) => {
              const value = e.target.value;
              if (isPreset(value)) {
                handlePresetChange(value);
              }
            }}
            className="
              w-full rounded-2xl border border-slate-700 px-3 py-2
              focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/25
              dark:bg-slate-800/70 dark:text-slate-100
            "
          >
            <option value="ethereal">空灵</option>
            <option value="metallic">金属</option>
            <option value="normal">通常</option>
            <option value="custom">自定义</option>
          </select>
        </div>
      </div>

      {selectedPreset === 'normal' && (
        <div className="mb-4 pb-1 rounded-2xl border border-slate-700/50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>击弦点</span>
            <span className="font-semibold">{lambda.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={lambda}
            onChange={handleLambdaChange}
            className="w-full accent-indigo-400"
          />
        </div>
      )}

      <div className="flex items-end gap-2 overflow-x-auto px-1 pb-3">
        {amplitudes.map((amp, index) => (
          <div key={index} className="flex flex-col items-center gap-3">
            <div className="text-xs">{amp.toFixed(2)}</div>
            <div className="relative flex h-36 w-6 items-center justify-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={amp}
                onChange={(e) => handleAmplitudeChange(index, parseFloat(e.target.value))}
                className="h-3 w-36 -rotate-90 appearance-none rounded-full bg-slate-700/80 accent-indigo-400"
              />
            </div>
            <div className="text-xs text-slate-400">{harmonicLabels[index]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimbreSelector;