import { Logger } from '@nestjs/common';

import { ExperimentType, OutputType, Experiment,
  ExperimentERP, ExperimentCVEP, ExperimentFVEP, ExperimentTVEP,
  ErpOutput, OutputDependency, TvepOutput, FvepOutput,
  outputTypeFromRaw, outputTypeToRaw} from 'diplomka-share';

import { ExperimentEntity } from './experiment.entity';
import { ExperimentErpEntity } from './type/experiment-erp.entity';
import { ExperimentErpOutputEntity } from './type/experiment-erp-output.entity';
import { ExperimentErpOutputDependencyEntity } from './type/experiment-erp-output-dependency.entity';
import { ExperimentCvepEntity } from './type/experiment-cvep.entity';
import { ExperimentFvepEntity } from './type/experiment-fvep.entity';
import { ExperimentTvepEntity } from './type/experiment-tvep.entity';
import { ExperimentTvepOutputEntity } from './type/experiment-tvep-output.entity';
import { ExperimentFvepOutputEntity } from './type/experiment-fvep-output.entity';

export function entityToExperiment(entity: ExperimentEntity): Experiment {
  return {
    id: entity.id,
    name: entity.name,
    description: entity.description,
    created: entity.created,
    type: ExperimentType[entity.type],
    usedOutputs: {},
    outputCount: 0
  };
}

export function experimentToEntity(experiment: Experiment): ExperimentEntity {
  const entity = new ExperimentEntity();
  entity.id = experiment.id;
  entity.name = experiment.name;
  entity.description = experiment.description;
  entity.created = experiment.created;
  entity.type = ExperimentType[experiment.type];
  return entity;
}

/**
 * Převede všechny true hodnoty z levé strany na pravou
 *
 * @param lhs Výstupní strana
 * @param rhs Zdrojová strana
 */
function mergeOutputTypes(lhs: OutputType, rhs: OutputType) {
  if (rhs.led) {
    lhs.led = true;
  }
  if (rhs.audio) {
    lhs.audio = true;
  }
  if (rhs.image) {
    lhs.image = true;
  }
}

export function entityToExperimentErp(
  experiment: Experiment,
  entity: ExperimentErpEntity,
  outputs: ExperimentErpOutputEntity[],
  dependencies: ExperimentErpOutputDependencyEntity[]): ExperimentERP {
  if (experiment.id !== entity.id) {
    Logger.error('Není možné propojit dva experimenty s různým ID!!!');
    throw Error('Byla detekována nekonzistence mezi ID experimentu.');
  }

  const usedOutputs: OutputType = { led: false, audio: false, image: false };
  const erpOutputs = outputs.map(output => {
    output.experimentId = experiment.id;
    const erpOutput: ErpOutput = entityToExperimentErpOutput(output, dependencies.filter(value => (value.sourceOutput - 1) === output.orderId));
    mergeOutputTypes(usedOutputs, erpOutput.outputType);
    return erpOutput;
  });

  return {
    id: experiment.id,
    name: experiment.name,
    description: experiment.description,
    type: experiment.type,
    created: experiment.created,
    usedOutputs,
    outputCount: entity.outputCount,
    maxDistributionValue: entity.maxDistributionValue,
    out: entity.out,
    wait: entity.wait,
    edge: entity.edge,
    random: entity.random,
    outputs: erpOutputs,
  };
}

export function experimentErpToEntity(experiment: ExperimentERP): ExperimentErpEntity {
  const entity = new ExperimentErpEntity();

  entity.id = experiment.id;
  entity.outputCount = experiment.outputCount;
  entity.maxDistributionValue = experiment.maxDistributionValue;
  entity.out = experiment.out;
  entity.wait = experiment.wait;
  entity.edge = experiment.edge;
  entity.random = experiment.random;

  return entity;
}

export function entityToExperimentErpOutput(entity: ExperimentErpOutputEntity, dependencies: ExperimentErpOutputDependencyEntity[]): ErpOutput {
  return {
    id: entity.id,
    experimentId: entity.experimentId,
    orderId: entity.orderId,
    outputType: outputTypeFromRaw(entity.type),
    pulseUp: entity.pulseUp,
    pulseDown: entity.pulseDown,
    distribution: entity.distribution,
    brightness: entity.brightness,
    dependencies: [dependencies.map(value => entityToExperimentErpOutputDependency(value)), null],
  };
}

export function experimentErpOutputToEntity(output: ErpOutput): ExperimentErpOutputEntity {
  const entity = new ExperimentErpOutputEntity();
  entity.id = output.id;
  entity.experimentId = output.experimentId;
  entity.orderId = output.orderId;
  entity.type = outputTypeToRaw(output.outputType);
  entity.pulseUp = output.pulseUp;
  entity.pulseDown = output.pulseDown;
  entity.distribution = output.distribution;
  entity.brightness = output.brightness;

  return entity;
}

export function entityToExperimentErpOutputDependency(entity: ExperimentErpOutputDependencyEntity): OutputDependency {
  return {
    id: entity.id,
    experimentId: entity.experimentId,
    sourceOutput: entity.sourceOutput - 1,
    destOutput: entity.destOutput - 1,
    count: entity.count,
  };
}

export function experimentErpOutputDependencyToEntity(dependency: OutputDependency): ExperimentErpOutputDependencyEntity {
  const entity = new ExperimentErpOutputDependencyEntity();

  entity.id = dependency.id;
  entity.experimentId = dependency.experimentId;
  entity.sourceOutput = dependency.sourceOutput + 1;
  entity.destOutput = dependency.destOutput + 1;
  entity.count = dependency.count;

  return entity;
}

export function entityToExperimentCvep(experiment: Experiment, entity: ExperimentCvepEntity): ExperimentCVEP {
  if (experiment.id !== entity.id) {
    Logger.error('Není možné propojit dva experimenty s různým ID!!!');
    throw Error('Byla detekována nekonzistence mezi ID experimentu.');
  }

  return {
    id: experiment.id,
    name: experiment.name,
    description: experiment.description,
    type: experiment.type,
    created: experiment.created,
    usedOutputs: outputTypeFromRaw(entity.type),
    outputCount: entity.outputCount,
    out: entity.out,
    wait: entity.wait,
    bitShift: entity.bitShift,
    pattern: entity.pattern,
    brightness: entity.brightness
  };
}

export function experimentCvepToEntity(experiment: ExperimentCVEP): ExperimentCvepEntity {
  const entity = new ExperimentCvepEntity();

  entity.id = experiment.id;
  entity.outputCount = experiment.outputCount;
  entity.type = outputTypeToRaw(experiment.usedOutputs);
  entity.out = experiment.out;
  entity.wait = experiment.wait;
  entity.bitShift = experiment.bitShift;
  entity.pattern = experiment.pattern;
  entity.brightness = experiment.brightness;

  return entity;
}

export function entityToExperimentFvep(experiment: Experiment, entity: ExperimentFvepEntity, outputs: ExperimentFvepOutputEntity[]): ExperimentFVEP {
  if (experiment.id !== entity.id) {
    Logger.error('Není možné propojit dva experimenty s různým ID!!!');
    throw Error('Byla detekována nekonzistence mezi ID experimentu.');
  }

  const usedOutputs: OutputType = { led: false, audio: false, image: false };
  const fvepOutputs = outputs.map(output => {
    output.experimentId = experiment.id;
    const fvepOutput: FvepOutput = entityToExperimentFvepOutput(output);
    mergeOutputTypes(usedOutputs, fvepOutput.outputType);
    return fvepOutput;
  });

  return {
    id: experiment.id,
    name: experiment.name,
    description: experiment.description,
    type: experiment.type,
    created: experiment.created,
    usedOutputs,
    outputCount: entity.outputCount,
    outputs: fvepOutputs
  };
}

export function experimentFvepToEntity(experiment: ExperimentFVEP): ExperimentFvepEntity {
  const entity = new ExperimentFvepEntity();

  entity.id = experiment.id;
  entity.outputCount = experiment.outputCount;

  return entity;
}

export function entityToExperimentFvepOutput(entity: ExperimentFvepOutputEntity): FvepOutput {
  return {
    id: entity.id,
    experimentId: entity.experimentId,
    orderId: entity.orderId,
    outputType: outputTypeFromRaw(entity.type),
    timeOn: entity.timeOn,
    timeOff: entity.timeOff,
    frequency: entity.frequency,
    dutyCycle: entity.dutyCycle,
    brightness: entity.brightness
  };
}

export function experimentFvepOutputToEntity(output: FvepOutput): ExperimentFvepOutputEntity {
  const entity = new ExperimentFvepOutputEntity();

  entity.id = output.id;
  entity.experimentId = output.experimentId;
  entity.orderId = output.orderId;
  entity.type = outputTypeToRaw(output.outputType);
  entity.timeOn = output.timeOn;
  entity.timeOff = output.timeOff;
  entity.frequency = output.frequency;
  entity.dutyCycle = output.dutyCycle;
  entity.brightness = output.brightness;

  return entity;
}

export function entityToExperimentTvep(experiment: Experiment, entity: ExperimentTvepEntity, outputs: ExperimentTvepOutputEntity[]): ExperimentTVEP {
  if (experiment.id !== entity.id) {
    Logger.error('Není možné propojit dva experimenty s různým ID!!!');
    throw Error('Byla detekována nekonzistence mezi ID experimentu.');
  }

  const usedOutputs: OutputType = { led: false, audio: false, image: false };
  const tvepOutputs = outputs.map(output => {
      output.experimentId = experiment.id;
      const tvepOutput: TvepOutput = entityToExperimentTvepOutput(output);
      mergeOutputTypes(usedOutputs, tvepOutput.outputType);
      return tvepOutput;
    });

  return {
    id: experiment.id,
    name: experiment.name,
    description: experiment.description,
    type: experiment.type,
    created: experiment.created,
    usedOutputs,
    outputCount: entity.outputCount,
    outputs: tvepOutputs
  };
}

export function experimentTvepToEntity(experiment: ExperimentTVEP): ExperimentTvepEntity {
  const entity = new ExperimentTvepEntity();

  entity.id = experiment.id;
  entity.outputCount = experiment.outputCount;

  return entity;
}

export function entityToExperimentTvepOutput(entity: ExperimentTvepOutputEntity): TvepOutput {
  return {
    id: entity.id,
    experimentId: entity.experimentId,
    orderId: entity.orderId,
    outputType: outputTypeFromRaw(entity.type),
    out: entity.out,
    wait: entity.wait,
    patternLength: entity.patternLength,
    pattern: entity.pattern,
    brightness: entity.brightness,
  };
}

export function experimentTvepOutputToEntity(output: TvepOutput): ExperimentTvepOutputEntity {
  const entity = new ExperimentTvepOutputEntity();

  entity.id = output.id;
  entity.experimentId = output.experimentId;
  entity.orderId = output.orderId;
  entity.type = outputTypeToRaw(output.outputType);
  entity.out = output.out;
  entity.wait = output.wait;
  entity.patternLength = output.patternLength;
  entity.pattern = output.pattern;
  entity.brightness = output.brightness;

  return entity;
}
