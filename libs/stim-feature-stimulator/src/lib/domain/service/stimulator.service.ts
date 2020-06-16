import { exec } from 'child_process';
import { Injectable, Logger } from '@nestjs/common';

import { Experiment } from '@stechy1/diplomka-share';

import * as buffers from '../model/protocol/functions.protocol';
import { FirmwareUpdateFailedException } from '../exception';
import { SerialService } from './serial.service';

@Injectable()
export class StimulatorService {
  private readonly logger: Logger = new Logger(StimulatorService.name);

  public currentExperiment = -1;

  constructor(private readonly service: SerialService) {}

  /**
   * Provede aktualizaci firmware stimulátoru
   *
   * @param path Cesta k firmware stimulátoru
   */
  public updateFirmware(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // firmware.path = "/tmp/firmware/some_random_name"
      exec(`sudo cp ${path} /mnt/stm/firmware.bin`, (err, stdout, stderr) => {
        if (err) {
          // some err occurred
          this.logger.error(err);
          throw new FirmwareUpdateFailedException();
        } else {
          // the *entire* stdout and stderr (buffered)
          this.logger.debug(`stdout: ${stdout}`);
          this.logger.error(`stderr: ${stderr}`);
          resolve();
        }
      });
    });
  }

  /**
   * Odešle příkaz na stimulátor, který obsahuje serializovaný experiment
   *
   * @param experiment Experiment, který se má nahrát
   * @param sequence Případná sekvence
   */
  public uploadExperiment(experiment: Experiment, sequence?: any) {
    this.logger.log(`Budu nahrávat experiment s ID: ${experiment.id}.`);
    // Získám experiment z databáze
    // const experiment: Experiment = await this._experiments.byId(id);
    // let sequence: Sequence;
    // // Pokud se jedná o typ ERP, vytáhnu si ještě sekvenci
    // if (experiment.type === ExperimentType.ERP) {
    //   sequence = await this._sequences.byId(
    //     (experiment as ExperimentERP).sequenceId
    //   );
    //   // Pokud není sekvence nalezena, tak to zaloguji
    //   // TODO upozornit uživatele, že není co přehrávat
    //   if (!sequence) {
    //     this.logger.error(
    //       'Sekvence nebyla nalezena! Je možné, že experiment se nebude moct nahrát.'
    //     );
    //   }
    // }
    // this.logger.log(`Experiment je typu: ${experiment.type}`);
    // // Odešlu přes IPC informaci, že nahrávám experiment na stimulátor
    // this._ipc.send(TOPIC_EXPERIMENT_STATUS, {
    //   status: 'upload',
    //   id,
    //   outputCount: experiment.outputCount,
    // });
    // // Provedu serilizaci a odeslání příkazu
    this.service.write(
      buffers.bufferCommandEXPERIMENT_UPLOAD(experiment, sequence)
    );
    // this.logger.log('Vytvářím novou instanci výsledku experimentu.');
    // // Ve výsledcích experimentu si založím novou instanci výsledku experimentu
    // this._experimentResults.createEmptyExperimentResult(experiment);
  }

  /**
   * Odešle příkaz na stimulátor, který inicializuje experiment
   *
   * @param id Id experimentu, který se má inicializovat
   */
  public setupExperiment(id: number) {
    // if (this._experimentResults.activeExperimentResult.experimentID !== id) {
    //   throw new Error(
    //     `${MessageCodes.CODE_ERROR_COMMANDS_EXPERIMENT_SETUP_NOT_UPLOADED}`
    //   );
    // }
    this.logger.log(`Budu nastavovat experiment s ID: ${id}`);
    // Odešlu přes IPC informaci, že budu inicializovat experiment
    // this._ipc.send(TOPIC_EXPERIMENT_STATUS, { status: 'setup', id });
    // Provedu serilizaci a odeslání příkazu
    this.service.write(buffers.bufferCommandMANAGE_EXPERIMENT('setup'));
  }

  /**
   * Spustí experiment
   *
   * @param id Id experimentu, který se má spustit
   */
  public runExperiment(id: number) {
    // if (this._experimentResults.activeExperimentResult.experimentID !== id) {
    //   throw new Error(
    //     `${MessageCodes.CODE_ERROR_COMMANDS_EXPERIMENT_RUN_NOT_INITIALIZED}`
    //   );
    // }
    this.logger.log(`Spouštím experiment: ${id}`);
    // Odešlu přes IPC informaci, že budu spouštět experiment
    // this._ipc.send(TOPIC_EXPERIMENT_STATUS, { status: 'run', id });
    // Provedu serilizaci a odeslání příkazu
    this.service.write(buffers.bufferCommandMANAGE_EXPERIMENT('run'));
  }

  /**
   * Pozastaví aktuálně spuštěný experiment
   *
   * @param id Id experimentu, který se má pozastavit
   */
  public pauseExperiment(id: number) {
    // if (this._experimentResults.activeExperimentResult.experimentID !== id) {
    //   throw new Error(
    //     `${MessageCodes.CODE_ERROR_COMMANDS_EXPERIMENT_PAUSE_NOT_STARTED}`
    //   );
    // }
    this.logger.log(`Pozastavuji experiment: ${id}`);
    // Odešlu přes IPC informaci, že budu pozastavovat experiment
    // this._ipc.send(TOPIC_EXPERIMENT_STATUS, { status: 'pause', id });
    // Provedu serilizaci a odeslání příkazu
    this.service.write(buffers.bufferCommandMANAGE_EXPERIMENT('pause'));
  }

  /**
   * Ukončí aktuálně spuštěný experiment
   *
   * @param id Id experimentu, který se má ukončit
   */
  public finishExperiment(id: number) {
    // if (this._experimentResults.activeExperimentResult.experimentID !== id) {
    //   throw new Error(
    //     `${MessageCodes.CODE_ERROR_COMMANDS_EXPERIMENT_FINISH_NOT_RUNNING}`
    //   );
    // }
    this.logger.log(`Zastavuji experiment: ${id}`);
    // Odešlu přes IPC informaci, že budu ukončovat experiment
    // this._ipc.send(TOPIC_EXPERIMENT_STATUS, { status: 'finish', id });
    // Provedu serilizaci a odeslání příkazu
    this.service.write(buffers.bufferCommandMANAGE_EXPERIMENT('finish'));
  }

  /**
   * Vymaže konfiguraci experimentu z paměti stimulátoru
   */
  public clearExperiment() {
    this.logger.log('Mažu konfiguraci experimentu...');
    // Odešlu přes IPC informaci, že budu mazat konfiguraci experimentu
    // this._ipc.send(TOPIC_EXPERIMENT_STATUS, { status: 'clear' });
    // Provedu serilizaci a odeslání příkazu
    this.service.write(buffers.bufferCommandMANAGE_EXPERIMENT('clear'));
  }

  /**
   * Odešle část ERP sekvence na stimulátor
   *
   * @param offset Offset v sekvenci, od kterého se mají odeslat data
   * @param index Index ve stimulátoru, na který se budou data ukládat (přijde s požadavkem)
   */
  public async sendNextSequencePart(offset: number, index: number) {
    // const experimentId = this._experimentResults.activeExperimentResult
    //   .experimentID;
    // const experiment: ExperimentERP = (await this._experiments.byId(
    //   experimentId
    // )) as ExperimentERP;
    // this.logger.log(
    //   `Budu nahrávat část sekvence s ID: ${experiment.sequenceId}. offset=${offset}, index=${index}`
    // );
    // const sequence: Sequence = await this._sequences.byId(
    //   experiment.sequenceId
    // );
    // this._serial.write(
    //   buffers.bufferCommandNEXT_SEQUENCE_PART(sequence, offset, index)
    // );
  }

  /**
   * Odešle příkaz k přepnutí stavu LED
   *
   * @param index Index, na kterém se LED nachází
   * @param enabled 1 = enabled; 0 = disabled
   */
  public togleLed(index: number, enabled: number) {
    this.logger.verbose(`Prepinam ledku na: ${enabled}`);
    const buffer = Buffer.from([0xf0, +index, +enabled, 0x53]);
    this.service.write(buffer);
    // this._serial.write(buffer);
  }
}
