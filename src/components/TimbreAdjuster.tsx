import React, { useEffect, useState } from 'react';
import type { Timbre, TimbreType } from '../types';
import { getTimbrePreset } from '../services/audio/AudioPresets';
import { AudioEngine } from '../services/audio/AudioEngine';
import ControlPanel from './shared/ControlPanel';
import ControlSelect from './shared/ControlSelect';
import ControlRange from './shared/ControRange';
import VerticalSliderGroup from './shared/VerticalSliderGroup';

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
    <ControlPanel>
      <div className="flex flex-col mb-2 gap-3">
        <ControlSelect
          value={timbre.type}
          onChange={(e) => {
            handlePresetChange(e.target.value as TimbreType);
          }}
        >
          <option value="ethereal">空灵</option>
          <option value="metallic">金属</option>
          <option value="pure">纯净</option>
          <option value="bright">明亮</option>
          <option value="normal">常规</option>
          <option value="soft">柔和</option>
          <option value="realistic">真实</option>
          <option value="custom">自定义</option>
        </ControlSelect>
      </div>

      {timbre.type === 'normal' && (
        <ControlRange
          label="击弦点"
          min="0"
          max="1"
          step="0.01"
          value={lambda}
          displayValue={lambda.toFixed(2)}
          onChange={(value) => handleParamsChange({ lambda: value })}
        />
      )}

      {(timbre.type === 'soft' || timbre.type === 'realistic') && (
        <ControlRange
          label="衰减率"
          min="0.01"
          max="1"
          step="0.01"
          value={sigma}
          displayValue={sigma.toFixed(2)}
          onChange={(value) => handleParamsChange({ sigma: value })}
        />
      )}

      {timbre.type === 'realistic' && (
        <ControlRange
          label="幂指数"
          min="0.5"
          max="4"
          step="0.1"
          value={p}
          displayValue={p.toFixed(2)}
          onChange={(value) => handleParamsChange({ p: value })}
        />
      )}

      <VerticalSliderGroup
        values={timbre.amplitudes}
        labels={harmonicLabels}
        min="0"
        max="1"
        step="0.01"
        onChange={handleAmplitudeChange}
      />
    </ControlPanel>
  );
};

export default TimbreAdjuster;
