import { Injectable } from "@nestjs/common";
import { smarthome, SmartHomeV1ExecuteRequest, SmartHomeV1QueryRequest } from 'actions-on-google';
import { SmartHomeV1SyncRequest } from "actions-on-google";

@Injectable({})
export class GoogleService {

    private app = smarthome({
      debug: true,
    });

    private storeState = {
        on: true,
        isPaused: false,
        isRunning: false,
    };

    constructor() {
      this.setupHandler();
    }

    public setupHandler(){
        this.app.onSync(async (body: SmartHomeV1SyncRequest) => await this.handleSync(body));
        this.app.onQuery(async (body: SmartHomeV1QueryRequest) => await this.handleQuery(body));
        this.app.onExecute(async (body: SmartHomeV1ExecuteRequest) => await this.handleExecute(body));
        this.app.onDisconnect(() => this.handleDisconnect());
    }
    
    public handleSync(body: SmartHomeV1SyncRequest): any{
        console.log('SYNC request received:', body);
        return {
            requestId: body.requestId,
            payload: {
              agentUserId: '123',
              devices: [{
                id: 'washer',
                type: 'action.devices.types.WASHER',
                traits: [
                  'action.devices.traits.OnOff',
                  'action.devices.traits.StartStop',
                  'action.devices.traits.RunCycle',
                ],
                name: {
                  defaultNames: ['My Washer'],
                  name: 'Washer',
                  nicknames: ['Washer'],
                }
              }, {
                id: 'light',
                type: 'action.devices.types.LIGHT',
                traits: [
                  'action.devices.traits.Brightness',
                  'action.devices.traits.OnOff',
                  'action.devices.traits.ColorSetting'
                ],
                name: {
                  defaultNames: [`Smart Lamp`],
                  name: 'Smart Lamp',
                  nicknames: ['abc']
                }
              }, {
                id: 'closet',
                type: 'action.devices.types.CLOSET',
                traits: [
                  'action.devices.traits.OpenClose',
                ],
                name: {
                  defaultNames: [`Smart Closet`],
                  name: 'Smart Closet',
                  nicknames: ['closet']
                }
              }, {
                id: 'fan',
                type: 'action.devices.types.FAN',
                traits: [
                  'action.devices.traits.OnOff',
                ],
                name: {
                  defaultNames: [`Smart Fan`],
                  name: 'Smart Fan',
                  nicknames: ['fan']         
                }     
              }],
            },
        };
    }

    public queryDatabase = async (deviceId: string) => {
        console.log("deviceId-", deviceId);
        return {
          on: this.storeState.on,
          isPaused: this.storeState.isPaused,
          isRunning: this.storeState.isRunning,
        };
    };

    public queryDevice = async (deviceId: string) => {
        const data = await this.queryDatabase(deviceId);
        return {
          on: data.on,
          isPaused: data.isPaused,
          isRunning: data.isRunning,
          currentRunCycle: [{
            currentCycle: 'rinse',
            nextCycle: 'spin',
            lang: 'en',
          }],
          currentTotalRemainingTime: 1212,
          currentCycleRemainingTime: 301,
        };
    };

    public async handleQuery(body: any): Promise<any>{
        const {requestId} = body;
        const payload = {
            devices: {},
        };
        if (!body.inputs || body.inputs.length === 0) {
          console.error('No inputs found in request:', JSON.stringify(body, null, 2));
          return {
            requestId: requestId,
            payload: payload,
          };
        }
        const queryPromises = [];
        const intent = body.inputs[0];
        for (const device of intent.payload.devices) {
            const deviceId = device.id;
            queryPromises.push(
                this.queryDevice(deviceId)
                    .then((data) => {
                      payload.devices[deviceId] = data;
                    }) 
            );
        }
        await Promise.all(queryPromises);
        return {
            requestId: requestId,
            payload: payload,
        };
    }

    public async updateDevice(execution: any, deviceId: string) {
        const { params, command } = execution;
        let state: any;
    
        switch (command) {
          case 'action.devices.commands.OnOff':
            state = { on: params.on };
            this.storeState.on = state.on;
            break;
          case 'action.devices.commands.StartStop':
            state = { isRunning: params.start };
            this.storeState.isRunning = state.isRunning;
            break;
          case 'action.devices.commands.PauseUnpause':
            state = { isPaused: params.pause };
            this.storeState.isPaused = state.isPaused;
            break;
        }
    
        return state;
    }

    public async handleExecute(body: SmartHomeV1ExecuteRequest): Promise<any>{
        const {requestId} = body;

        const result = {
            ids: [],
            status: 'SUCCESS',
            states: {
            online: true,
            },
        };

        if (!body.inputs || body.inputs.length === 0) {
          console.error('No inputs found in request:', JSON.stringify(body, null, 2));
          return {
            requestId: requestId,
            payload: {
              commands: [result],
            },
          };
        }

        const executePromises = [];
        const intent = body.inputs[0];
        for (const command of intent.payload.commands) {
            for (const device of command.devices) {
                for (const execution of command.execution) {
                    executePromises.push(
                        this.updateDevice(execution, device.id)
                            .then((data) => {
                            result.ids.push(device.id);
                            Object.assign(result.states, data);
                            })
                            .catch(() => console.error('EXECUTE', device.id)));
                }
            }
        }
    }

    public async handleDisconnect(): Promise<any>{
        console.log('User account unlinked from Google Assistant');
        return {};
    }

    getApp() {
      return this.app;
    }
}