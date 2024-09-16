import { All, Controller, Next, Post, Redirect, Req, Res } from "@nestjs/common";
import { GoogleService } from "./google.service";
import { Request, Response } from "express";
import { smarthome, SmartHomeV1Request, SmartHomeV1Response, SmartHomeV1SyncRequest, SmartHomeV1SyncResponse, SmartHomeV1ExecuteRequest, SmartHomeV1ExecuteResponse } from "actions-on-google";

@Controller('smarthome')
export class GoogleController {
    constructor() { }

    @Post('/fulfillment')
    async handleFulfillment() {

        const app = smarthome({ debug: true });

        app.onSync((body: SmartHomeV1SyncRequest) : SmartHomeV1SyncResponse => {
            return {
                requestId: body.requestId,
                payload: {
                    agentUserId: process.env.USER_ID,
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
                        },
                        willReportState: false
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
                        },
                        willReportState: false
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
                        },
                        willReportState: false
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
                        },
                        willReportState: false
                    }],
                },
            };
        });

        var storeState = {
            on: true,
            isPaused: false,
            isRunning: false
        };


        const queryFirebase = async (deviceId: string) => {
            // const snapshot = await firebaseRef.child(deviceId).once('value');
            // const snapshotVal = snapshot.val();
            console.log("deviceId--", deviceId);
            return {
                on: storeState.on,
                isPaused: storeState.isPaused,
                isRunning: storeState.isRunning,
            };
        };
        const queryDevice = async (deviceId: string) => {
            const data = await queryFirebase(deviceId);
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

        app.onQuery(async (body) => {
            const { requestId } = body;
            const payload = {
                devices: {},
            };
            const queryPromises = [];
            const intent = body.inputs[0];
            for (const device of intent.payload.devices) {
                const deviceId = device.id;
                queryPromises.push(
                    queryDevice(deviceId)
                        .then((data) => {
                            // Add response to device payload
                            payload.devices[deviceId] = data;
                        }));
            }
            // Wait for all promises to resolve
            await Promise.all(queryPromises);
            return {
                requestId: requestId,
                payload: payload,
            };
        });

        const updateDevice = async (execution, deviceId) => {
            const { params, command } = execution;
            let state;
            let ref;
            switch (command) {
                case 'action.devices.commands.OnOff':
                    state = { on: params.on };
                    storeState.on = state.on;
                    break;
                case 'action.devices.commands.StartStop':
                    state = { isRunning: params.start };
                    storeState.isRunning = state.isRunning;
                    break;
                case 'action.devices.commands.PauseUnpause':
                    state = { isPaused: params.pause };
                    storeState.isPaused = state.isPaused;
                    break;
            }

            // return ref.update(state)
            //     .then(() => state);
            return state;
        };

        app.onExecute(async (body:SmartHomeV1ExecuteRequest): Promise<SmartHomeV1ExecuteResponse> => {
            const { requestId } = body;
            // Execution results are grouped by status
            const result:any = {
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
                            updateDevice(execution, device.id)
                                .then((data) => {
                                    result.ids.push(device.id);
                                    Object.assign(result.states, data);
                                })
                                .catch(() => console.error('EXECUTE', device.id)));
                    }
                }
            }

            await Promise.all(executePromises);
            return {
                requestId: requestId,
                payload: {
                    commands: [result],
                },
            };
        });

        app.onDisconnect(() => {
            console.log('User account unlinked from Google Assistant');
            // Return empty response
            return {};
        });

        return app;
    }

    @All('/*')
    async handleAll(@Req() req: Request, @Res() res: Response) {
        console.log("Intercepting smarthome requests ...", req.method);
    }
}