// import { Client, Server, Socket } from 'socket.io';
//
// import {
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
// } from '@nestjs/websockets';
// import { Logger } from '@nestjs/common';
//
// import { CommandClientToServer } from '@stechy1/diplomka-share';
//
// import { ExperimentsService } from 'libs/stim-feature-experiments/src/lib/domain/services/experiments.service';
// import { CommandsService } from './commands.service';
// import { ExperimentResultsService } from 'libs/stim-feature-experiment-results/src/lib/domain/services/experiment-results.service';
//
// @WebSocketGateway({ namespace: '/commands' })
// export class CommandsGateway
//   implements OnGatewayConnection, OnGatewayDisconnect {
//   private readonly logger: Logger = new Logger(CommandsGateway.name);
//
//   private readonly _commands: { [s: string]: (...data: any) => void } = {};
//
//   @WebSocketServer()
//   server: Server;
//
//   constructor(
//     private readonly _service: CommandsService,
//     _experiments: ExperimentsService,
//     _experimentResults: ExperimentResultsService
//   ) {
//     this._commands[CommandClientToServer.COMMAND_STIMULATOR_STATE] = () =>
//       _service.stimulatorState(false);
//     this._commands[CommandClientToServer.COMMAND_EXPERIMENT_RUN] = () =>
//       _service.runExperiment(_experimentResults.activeExperimentResult?.id);
//     this._commands[CommandClientToServer.COMMAND_EXPERIMENT_PAUSE] = () =>
//       _service.pauseExperiment(_experimentResults.activeExperimentResult?.id);
//     this._commands[CommandClientToServer.COMMAND_EXPERIMENT_FINISH] = () =>
//       _service.finishExperiment(_experimentResults.activeExperimentResult?.id);
//     this._commands[CommandClientToServer.COMMAND_EXPERIMENT_UPLOAD] = async (
//       experimentId: number
//     ) => {
//       await this._service.uploadExperiment(experimentId);
//     };
//     this._commands[CommandClientToServer.COMMAND_EXPERIMENT_SETUP] = async (
//       experimentID: number
//     ) => {
//       await _service.setupExperiment(experimentID);
//     };
//     this._commands[CommandClientToServer.COMMAND_EXPERIMENT_CLEAR] = () =>
//       _service.clearExperiment();
//     this._commands[CommandClientToServer.COMMAND_OUTPUT_SET] = (data: {
//       index: number;
//       brightness: number;
//     }) => _service.togleLed(data.index, data.brightness);
//     this._commands[CommandClientToServer.COMMAND_MEMORY] = (
//       memoryType: number
//     ) => _service.memoryRequest(memoryType);
//     this._commands[CommandClientToServer.COMMAND_SEQUENCE_PART] = async (data: {
//       offset: number;
//       index: number;
//     }) => {
//       await _service.sendNextSequencePart(data.offset, data.index);
//     };
//
//     _service.registerMessagePublisher((topic: string, data: any) =>
//       this._messagePublisher(topic, data)
//     );
//
//     // this._commands[CommandClientToServer.COMMAND_DISPLAY_CLEAR] = buffers.bufferCommandDISPLAY_CLEAR;
//     // this._commands[CommandClientToServer.COMMAND_DISPLAY_TEXT] = (data: any) => buffers.bufferCommandDISPLAY_SET(data.x, data.y, data.text);
//   }
//
//   private _messagePublisher(topic: string, data: any) {
//     this.server.emit(topic, data);
//   }
//
//   handleConnection(client: Client, ...args: any[]): any {
//     this.logger.verbose(`Klient ${client.id} navázal spojení...`);
//   }
//
//   handleDisconnect(client: Client): any {
//     this.logger.verbose(`Klient ${client.id} ukončil spojení...`);
//   }
//
//   @SubscribeMessage('command')
//   async handleCommand(client: Socket, message: { name: string; data: any }) {
//     this.logger.debug(`Přišel nový command: '${message.name}'`);
//     if (this._commands[message.name] === undefined) {
//       this.logger.error('Příkaz nebyl rozpoznán!');
//       client.emit('command', {
//         valid: false,
//         message: 'Příkaz nebyl rozpoznán!',
//       });
//     }
//
//     try {
//       await this._commands[message.name](message.data);
//       client.emit('command', { valid: true });
//     } catch (error) {
//       if (!isNaN(parseInt(error.message, 10))) {
//         client.emit('command', {
//           valid: false,
//           code: parseInt(error.message, 10),
//           params: message.data,
//         });
//       } else {
//         client.emit('command', { valid: false, message: error.message });
//       }
//     }
//   }
// }