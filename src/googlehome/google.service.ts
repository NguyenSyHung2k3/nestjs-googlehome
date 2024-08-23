import { Injectable } from "@nestjs/common";
import { google } from 'googleapis';
import { SmartHome, smarthome } from 'actions-on-google';
@Injectable({})
export class GoogleService {
    private readonly USER_ID = 123;
    private readonly homegraph;
    private readonly app = smarthome();
    private storeState = {
        on: true,
        isPaused: false,
        isRunning: false,
    };

    constructor() {
        const auth = new google.auth.GoogleAuth({
            keyFilename: 'smart-home-key.json',
            scopes: ['https://www.googleapis.com/auth/homegraph'],
        });
        this.homegraph = google.homegraph({
            version: 'v1',
            auth: auth,
        });
        this.setupHandler();
        
    }

    private setupHandler(){
        this.app.onSync((body) => this.handleSync(body));
        this.app.onQuery((body) => this.handleQuery(body));
        this.app.onExecute((body) => this.handleExecute(body));
        this.app.onDisconnect(() => this.handleDisconnect());
    }
    
    private handleSync(body: any): any{
        return {
            requestId: body.requestId,
            payload: {
              agentUserId: this.USER_ID,
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

    private queryFirebase = async (deviceId) => {
        console.log("deviceId--", deviceId);
        return {
          on: this.storeState.on,
          isPaused: this.storeState.isPaused,
          isRunning: this.storeState.isRunning,
        };
    };

    private queryDevice = async (deviceId) => {
        const data = await this.queryFirebase(deviceId);
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

    private async handleQuery(body: any): Promise<any>{
        const {requestId} = body;
        const payload = {
            devices: {},
        };
        const queryPromises = [];
        const intent = body.inputs[0];
        for (const device of intent.payload.devices) {
            const deviceId = device.id;
            queryPromises.push(
                this.queryDevice(deviceId)
                    .then((data) => {
                    payload.devices[deviceId] = data;
                    }) );
        }
        await Promise.all(queryPromises);
        return {
            requestId: requestId,
            payload: payload,
        };
    }

    private async updateDevice(execution: any, deviceId: string) {
        const { params, command } = execution;
        let state;
    
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

    private handleExecute(body: any): any{
        const {requestId} = body;

        const result = {
            ids: [],
            status: 'SUCCESS',
            states: {
            online: true,
            },
        };

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

    private async handleDisconnect(){
        console.log('User account unlinked from Google Assistant');
        return {};
    }

    getApp() {
        return this.app;
    }
}