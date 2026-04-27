import React, { useState, useEffect } from 'react';
import type { TransferFunctionType, TransferFunction } from '../types';
import { getTransferFunctionPreset } from '../services/audio/AudioPresets';
import { AudioEngine } from '../services/audio/AudioEngine';

interface TransferFunctionModifierProps {
  audioEngine: AudioEngine;
}

const TransferFunctionModifier: React.FC<TransferFunctionModifierProps> = ({
  audioEngine,
}) => {
  const [baseFreq, setBaseFreq] = useState<number>(440);
  const [transferFunction, setTransferFunction] = useState<TransferFunction>(
    () => getTransferFunctionPreset('delay', 0, 0.1, 2000, 440),
  );

  useEffect(() => {
    audioEngine.setTransferFunction(transferFunction);
  }, [transferFunction, audioEngine]);

  const handlePresetChange = (preset: TransferFunctionType) => {
    setTransferFunction((prev) =>
      getTransferFunctionPreset(
        preset,
        prev.tau,
        prev.alpha,
        prev.fc,
        baseFreq,
      ),
    );
  };

  const handleParamsChange = (updates: {
    tau?: number;
    alpha?: number;
    fc?: number;
    baseFreq?: number;
  }) => {
    setTransferFunction((prev) =>
      getTransferFunctionPreset(
        prev.type,
        updates.tau ?? prev.tau,
        updates.alpha ?? prev.alpha,
        updates.fc ?? prev.fc,
        updates.baseFreq ?? baseFreq,
      ),
    );
    if (updates.baseFreq) setBaseFreq(updates.baseFreq);
  };

  const harmonicLabels = Array.from(
    { length: transferFunction.magnitudes.length },
    (_, index) => (
      <span>
        f<sub>{index + 1}</sub>
      </span>
    ),
  );

  return (
    <div className="w-full sm:w-auto p-5 rounded-3xl border border-slate-700/50 shadow-xl shadow-slate-950/20 backdrop-blur-sm">
      <div className="mb-2 flex flex-col gap-3">
        <div className="space-y-2">
          <select
            value={transferFunction.type}
            onChange={(e) =>
              handlePresetChange(e.target.value as TransferFunctionType)
            }
            className="
              w-full rounded-2xl border border-slate-700 px-3 py-2
              focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/25
              dark:bg-slate-800/70 dark:text-slate-100
            "
          >
            <option value="delay">纯延时</option>
            <option value="single_echo">单回声</option>
            <option value="multi_echo">多回声</option>
            <option value="lowpass">低通</option>
            <option value="highpass">高通</option>
            <option value="allpass">全通</option>
          </select>
        </div>
      </div>

      <div className="mb-4 pb-1 rounded-2xl border border-slate-700/50 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span>基频</span>
          <span className="font-semibold">{baseFreq} Hz</span>
        </div>
        <input
          type="range"
          min="20"
          step="1"
          max="20000"
          value={baseFreq}
          onChange={(e) =>
            handleParamsChange({ baseFreq: parseInt(e.target.value) })
          }
          className="w-full accent-blue-400"
        />
      </div>

      {(transferFunction.type === 'delay' ||
        transferFunction.type === 'single_echo' ||
        transferFunction.type === 'multi_echo' ||
        transferFunction.type === 'allpass') && (
        <div className="mb-4 pb-1 rounded-2xl border border-slate-700/50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>延迟时间</span>
            <span className="font-semibold">
              {transferFunction.tau.toFixed(1)} ms
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={transferFunction.tau}
            onChange={(e) =>
              handleParamsChange({ tau: parseFloat(e.target.value) })
            }
            className="w-full accent-indigo-400"
          />
        </div>
      )}

      {(transferFunction.type === 'single_echo' ||
        transferFunction.type === 'multi_echo' ||
        transferFunction.type === 'allpass') && (
        <div className="mb-4 pb-1 rounded-2xl border border-slate-700/50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>衰减系数</span>
            <span className="font-semibold">
              {transferFunction.alpha.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={transferFunction.alpha}
            onChange={(e) =>
              handleParamsChange({ alpha: parseFloat(e.target.value) })
            }
            className="w-full accent-indigo-400"
          />
        </div>
      )}

      {(transferFunction.type === 'lowpass' ||
        transferFunction.type === 'highpass') && (
        <div className="mb-4 pb-1 rounded-2xl border border-slate-700/50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>频率阈值</span>
            <span className="font-semibold">{transferFunction.fc} Hz</span>
          </div>
          <input
            type="range"
            min="20"
            max="20000"
            step="10"
            value={transferFunction.fc}
            onChange={(e) =>
              handleParamsChange({ fc: parseFloat(e.target.value) })
            }
            className="w-full accent-indigo-400"
          />
        </div>
      )}

      <h3 className="mb-2 text-lg font-medium">幅频特性</h3>
      <div className="flex items-end gap-2 overflow-x-auto px-1 pb-3">
        {transferFunction.magnitudes.map((mag, index) => (
          <div
            key={`mag-${index}`}
            className="flex flex-1 flex-col items-center gap-3"
          >
            <div className="text-xs">{mag.toFixed(2)}</div>
            <div className="relative flex h-36 w-8 items-center justify-center">
              <input
                type="range"
                min="0"
                max="2"
                step="0.01"
                value={mag}
                disabled
                className="h-3 w-36 -rotate-90 appearance-none rounded-full bg-slate-700/80 accent-indigo-400 cursor-not-allowed"
              />
            </div>
            <div className="text-xs text-slate-400">
              {harmonicLabels[index]}
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-2 text-lg font-medium">相频特性</h3>
      <div className="flex items-end gap-2 overflow-x-auto px-1 pb-3">
        {transferFunction.phases.map((phase, index) => (
          <div
            key={`phase-${index}`}
            className="flex flex-1 flex-col items-center gap-3"
          >
            <div className="text-xs">{phase.toFixed(0)}°</div>
            <div className="relative flex h-36 w-8 items-center justify-center">
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={phase}
                disabled
                className="h-3 w-36 -rotate-90 appearance-none rounded-full bg-slate-700/80 accent-indigo-400 cursor-not-allowed"
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

export default TransferFunctionModifier;
