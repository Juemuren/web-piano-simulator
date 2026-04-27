import React, { useState, useEffect } from 'react';
import type { TimbreType, Timbre } from '../types';
import { getTimbrePreset } from '../services/audio/AudioPresets';
import { AudioEngine } from '../services/audio/AudioEngine';

interface TimbreAdjusterProps {
  audioEngine: AudioEngine;
}

const TimbreAdjuster: React.FC<TimbreAdjusterProps> = ({ audioEngine }) => {
  const [lambda, setLambda] = useState(0.5);
  const [sigma, setSigma] = useState(0.8);
  const [p, setP] = useState(1.5);
  const [timbre, setTimbre] = useState<Timbre>(() =>
    getTimbrePreset('ethereal', 0.5, 0.8, 1.5),
  );

  useEffect(() => {
    audioEngine.setTimbre(timbre);
  }, [timbre, audioEngine]);

  const handlePresetChange = (preset: TimbreType) => {
    setTimbre(getTimbrePreset(preset, lambda, sigma, p));
  };

  const handleParamsChange = (update: {
    lambda?: number;
    sigma?: number;
    p?: number;
  }) => {
    setTimbre((prev) =>
      getTimbrePreset(
        prev.type,
        update.lambda ?? lambda,
        update.sigma ?? sigma,
        update.p ?? p,
      ),
    );
    if (update.lambda) setLambda(update.lambda);
    if (update.sigma) setSigma(update.sigma);
    if (update.p) setP(update.p);
  };

  const handleAmplitudeChange = (index: number, value: number) => {
    setTimbre((prev) => {
      const amplitudes = [...prev.amplitudes];
      amplitudes[index] = value;
      return {
        type: 'custom',
        amplitudes,
      };
    });
  };

  const harmonicLabels = Array.from(
    { length: timbre.amplitudes.length },
    (_, index) => (
      <span>
        f<sub>{index + 1}</sub>
      </span>
    ),
  );

  return (
    <div className="w-full sm:w-auto p-5 rounded-3xl border border-slate-700/50 shadow-xl shadow-slate-950/20 backdrop-blur-sm">
      <div className="flex flex-col mb-2 gap-3">
        <select
          value={timbre.type}
          onChange={(e) => {
            handlePresetChange(e.target.value as TimbreType);
          }}
          className="
              w-full rounded-2xl border border-slate-700 px-3 py-2
              focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/25
              dark:bg-slate-800/70 dark:text-slate-100
            "
        >
          <option value="ethereal">空灵</option>
          <option value="metallic">金属</option>
          <option value="pure">纯净</option>
          <option value="bright">明亮</option>
          <option value="normal">常规</option>
          <option value="soft">柔和</option>
          <option value="realistic">真实</option>
          <option value="custom">自定义</option>
        </select>
      </div>

      {timbre.type === 'normal' && (
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
            onChange={(e) =>
              handleParamsChange({ lambda: parseFloat(e.target.value) })
            }
            className="w-full accent-indigo-400"
          />
        </div>
      )}

      {(timbre.type === 'soft' || timbre.type === 'realistic') && (
        <div className="mb-4 pb-1 rounded-2xl border border-slate-700/50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>衰减率</span>
            <span className="font-semibold">{sigma.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="1"
            step="0.01"
            value={sigma}
            onChange={(e) =>
              handleParamsChange({ sigma: parseFloat(e.target.value) })
            }
            className="w-full accent-indigo-400"
          />
        </div>
      )}

      {timbre.type === 'realistic' && (
        <div className="mb-4 pb-1 rounded-2xl border border-slate-700/50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>幂指数</span>
            <span className="font-semibold">{p.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.1"
            value={p}
            onChange={(e) =>
              handleParamsChange({ p: parseFloat(e.target.value) })
            }
            className="w-full accent-indigo-400"
          />
        </div>
      )}

      <div className="flex items-end gap-2 overflow-x-auto px-1 pb-3">
        {timbre.amplitudes.map((amp, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-3">
            <div className="text-xs">{amp.toFixed(2)}</div>
            <div className="relative flex h-36 w-8 items-center justify-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={amp}
                onChange={(e) =>
                  handleAmplitudeChange(index, parseFloat(e.target.value))
                }
                className="h-3 w-36 -rotate-90 appearance-none rounded-full bg-slate-700/80 accent-indigo-400"
              />
            </div>
            <div className="text-xs text-slate-400">
              {harmonicLabels[index]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimbreAdjuster;
