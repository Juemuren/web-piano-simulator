import React, { useEffect, useState } from 'react';
import { AudioEngine } from '../services/audio/AudioEngine';
import ControlPanel from './shared/ControlPanel';
import ControlSelect from './shared/ControlSelect';
import ControlRange from './shared/ControRange';

interface HarmonicSynthesizerProps {
  audioEngine: AudioEngine;
}

const HarmonicSynthesizer: React.FC<HarmonicSynthesizerProps> = ({
  audioEngine,
}) => {
  const [oscillatorType, setOscillatorType] = useState(
    audioEngine.getOscillatorType(),
  );
  const [volume, setVolume] = useState(audioEngine.getVolume());
  const [attackTime, setAttackTime] = useState(audioEngine.getAttackTime());
  const [decayTime, setDecayTime] = useState(audioEngine.getDecayTime());
  const [releaseTime, setReleaseTime] = useState(audioEngine.getReleaseTime());
  const [sustainGain, setSustainGain] = useState(audioEngine.getSustainGain());
  const [silenceGain, setSilenceGain] = useState(audioEngine.getSilenceGain());

  useEffect(() => {
    audioEngine.setOscillatorType(oscillatorType);
  }, [oscillatorType, audioEngine]);

  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume, audioEngine]);

  useEffect(() => {
    audioEngine.setAttackTime(attackTime);
  }, [attackTime, audioEngine]);

  useEffect(() => {
    audioEngine.setDecayTime(decayTime);
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
    <ControlPanel>
      <div className="mb-4 flex flex-col gap-3">
        <div className="space-y-2">
          <ControlSelect
            value={oscillatorType}
            onChange={(e) =>
              setOscillatorType(e.target.value as OscillatorType)
            }
          >
            <option value="sine">正弦波</option>
            <option value="triangle">三角波</option>
            <option value="sawtooth">锯齿波</option>
            <option value="square">方波</option>
          </ControlSelect>
        </div>
      </div>

      <ControlRange
        label="音量系数"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        displayValue={volume.toFixed(2)}
        onChange={setVolume}
      />
      <ControlRange
        label="起音时间"
        min="0.001"
        max="0.1"
        step="0.001"
        value={attackTime}
        displayValue={`${attackTime.toFixed(3)} s`}
        onChange={setAttackTime}
      />
      <ControlRange
        label="衰音时间"
        min="0.01"
        max="1"
        step="0.01"
        value={decayTime}
        displayValue={`${decayTime.toFixed(2)} s`}
        onChange={setDecayTime}
      />
      <ControlRange
        label="释音时间"
        min="0.01"
        max="1"
        step="0.01"
        value={releaseTime}
        displayValue={`${releaseTime.toFixed(2)} s`}
        onChange={setReleaseTime}
      />
      <ControlRange
        label="稳音增益"
        min="0.1"
        max="1"
        step="0.01"
        value={sustainGain}
        displayValue={sustainGain.toFixed(2)}
        onChange={setSustainGain}
      />
      <ControlRange
        label="静音增益"
        min="0.000001"
        max="0.001"
        step="0.000001"
        value={silenceGain}
        displayValue={silenceGain.toExponential(2)}
        onChange={setSilenceGain}
      />
    </ControlPanel>
  );
};

export default HarmonicSynthesizer;
