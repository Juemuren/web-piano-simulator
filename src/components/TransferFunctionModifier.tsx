import React, { useEffect, useState } from 'react';
import type { TransferFunction, TransferFunctionType } from '../types';
import { getTransferFunctionPreset } from '../services/audio/AudioPresets';
import { AudioEngine } from '../services/audio/AudioEngine';
import ControlPanel from './shared/ControlPanel';
import ControlSelect from './shared/ControlSelect';
import ControlRange from './shared/ControRangel';
import VerticalSliderGroup from './shared/VerticalSliderGroup';

interface TransferFunctionModifierProps {
  audioEngine: AudioEngine;
}

const TransferFunctionModifier: React.FC<TransferFunctionModifierProps> = ({
  audioEngine,
}) => {
  const [baseFreq, setBaseFreq] = useState<number>(440);
  const [transferFunction, setTransferFunction] = useState<TransferFunction>(
    () => getTransferFunctionPreset('delay', 0, 0.1, 20, 20000, 440),
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
        prev.minFreq,
        prev.maxFreq,
        baseFreq,
      ),
    );
  };

  const handleParamsChange = (updates: {
    tau?: number;
    alpha?: number;
    minFreq?: number;
    maxFreq?: number;
    baseFreq?: number;
  }) => {
    setTransferFunction((prev) =>
      getTransferFunctionPreset(
        prev.type,
        updates.tau ?? prev.tau,
        updates.alpha ?? prev.alpha,
        updates.minFreq ?? prev.minFreq,
        updates.maxFreq ?? prev.maxFreq,
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
    <ControlPanel>
      <div className="mb-2 flex flex-col gap-3">
        <div className="space-y-2">
          <ControlSelect
            value={transferFunction.type}
            onChange={(e) =>
              handlePresetChange(e.target.value as TransferFunctionType)
            }
          >
            <option value="delay">纯延时</option>
            <option value="single_echo">单回声</option>
            <option value="multi_echo">多回声</option>
            <option value="low_pass">低通</option>
            <option value="high_pass">高通</option>
            <option value="band_pass">带通</option>
            <option value="all_pass">全通</option>
          </ControlSelect>
        </div>
      </div>

      <ControlRange
        label="基频"
        min="20"
        max="20000"
        step="1"
        value={baseFreq}
        displayValue={`${baseFreq} Hz`}
        accentClassName="accent-sky-500"
        onChange={(value) => handleParamsChange({ baseFreq: value })}
      />

      {(transferFunction.type === 'delay' ||
        transferFunction.type === 'single_echo' ||
        transferFunction.type === 'multi_echo' ||
        transferFunction.type === 'all_pass') && (
        <ControlRange
          label="延迟时间"
          min="0"
          max="100"
          step="0.1"
          value={transferFunction.tau}
          displayValue={`${transferFunction.tau.toFixed(1)} ms`}
          onChange={(value) => handleParamsChange({ tau: value })}
        />
      )}

      {(transferFunction.type === 'single_echo' ||
        transferFunction.type === 'multi_echo' ||
        transferFunction.type === 'all_pass') && (
        <ControlRange
          label="衰减系数"
          min="0"
          max="0.5"
          step="0.01"
          value={transferFunction.alpha}
          displayValue={transferFunction.alpha.toFixed(2)}
          onChange={(value) => handleParamsChange({ alpha: value })}
        />
      )}

      {(transferFunction.type === 'low_pass' ||
        transferFunction.type === 'band_pass') && (
        <ControlRange
          label="最小频率"
          min="20"
          max="20000"
          step="10"
          value={transferFunction.minFreq}
          displayValue={`${transferFunction.minFreq} Hz`}
          onChange={(value) => handleParamsChange({ minFreq: value })}
        />
      )}

      {(transferFunction.type === 'high_pass' ||
        transferFunction.type === 'band_pass') && (
        <ControlRange
          label="最大频率"
          min="20"
          max="20000"
          step="10"
          value={transferFunction.maxFreq}
          displayValue={`${transferFunction.maxFreq} Hz`}
          onChange={(value) => handleParamsChange({ maxFreq: value })}
        />
      )}

      <h3 className="mb-2 text-lg font-medium">幅频特性</h3>
      <VerticalSliderGroup
        values={transferFunction.magnitudes}
        labels={harmonicLabels}
        min="0"
        max="2"
        step="0.01"
        getKey={(index) => `mag-${index}`}
        disabled
      />

      <h3 className="mb-2 text-lg font-medium">相频特性</h3>
      <VerticalSliderGroup
        values={transferFunction.phases}
        labels={harmonicLabels}
        min="-180"
        max="180"
        step="1"
        getKey={(index) => `phase-${index}`}
        formatValue={(value) => `${value.toFixed(0)}°`}
        disabled
      />
    </ControlPanel>
  );
};

export default TransferFunctionModifier;
