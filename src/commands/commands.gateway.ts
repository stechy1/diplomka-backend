import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Client, Socket } from 'socket.io';

import { Experiment } from '@stechy1/diplomka-share';

import { SERVER_SOCKET_PORT } from '../config/config';
import { SerialService } from '../low-level/serial.service';
import { ExperimentsService } from '../experiments/experiments.service';
import * as buffers from './protocol/functions.protocol';
import { CommandsService } from './commands.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway(SERVER_SOCKET_PORT, {namespace: '/commands'})
export class CommandsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  private readonly logger: Logger = new Logger(CommandsGateway.name);

  private readonly commands: {[s: string]: (...data: any) => void} = {};

  constructor(private readonly _service: CommandsService,
              private readonly _experiments: ExperimentsService) {
    this.commands['experiment-start'] = () => _service.startExperiment(_experiments.experimentResult.id);
    this.commands['experiment-stop'] = () => _service.stopExperiment(_experiments.experimentResult.id);
    this.commands['experiment-upload'] = async (experimentId: number) => {
      await this._service.uploadExperiment(experimentId);
    };
    this.commands['experiment-setup'] = async (experimentID: number) => {
      await _service.setupExperiment(experimentID);
    };
    this.commands['experiment-clear'] = () =>  _service.clearExperiment();
    this.commands['output-set'] = (data: any) => _service.togleLed(data.index, data.brightness);
    this.commands['memory'] = (memoryType: number) => _service.memoryRequest(memoryType);

    // this.commands['display-clear'] = buffers.bufferCommandDISPLAY_CLEAR;
    // this.commands['display-text'] = (data: any) => buffers.bufferCommandDISPLAY_SET(data.x, data.y, data.text);
    // this.commands['experiment-setup'] = async (experimentID: number) => {
    //   const experiment: Experiment = await _experiments.byId(experimentID);
    //   return buffers.bufferCommandEXPERIMENT_SETUP(experiment);
    // };
    // this.commands['experiment-init'] = buffers.bufferCommandINIT_EXPERIMENT;
    // this.commands['experiment-start'] = () => buffers.bufferCommandMANAGE_EXPERIMENT(true);
    // this.commands['experiment-stop'] = () => buffers.bufferCommandMANAGE_EXPERIMENT(false);
    // this.commands['experiment-clear'] = buffers.bufferCommandCLEAR_EXPERIMENT;
    // this.commands['output-set'] = (data: any) => buffers.bufferCommandBACKDOOR_1(data.index, data.brightness);
  }

  handleConnection(client: Client, ...args: any[]): any {
    this.logger.verbose(`Klient ${client.id} navázal spojení...`);
  }

  handleDisconnect(client: Client): any {
    this.logger.verbose(`Klient ${client.id} ukončil spojení...`);
  }

  @SubscribeMessage('command')
  async handleCommand(client: Socket, message: {name: string, data: any}) {
    this.logger.debug(`Přišel nový command: '${message.name}'`);
    if (this.commands[message.name] === undefined) {
      this.logger.error('Příkaz nebyl rozpoznán!');
      client.emit('command', {valid: false, message: 'Příkaz nebyl rozpoznán!'});
    }

    try {
      await this.commands[message.name](message.data);
      client.emit('command', {valid: true});
    } catch (e) {
      client.emit('command', {valid: false, message: 'Příkaz se nepovedlo vykonat!'});
    }

  }

}
