import Axios from "axios";
import {appConfig} from '../config.js';

export const Actions = {
    loginByCode({commit}, data) {
        let self = this;
        return new Promise((resolve, reject) => {
            commit('auth_request');
            var url = appConfig.baseAPIURL + '/fe/auth/by-code';

            Axios({url: url, data: data, method: 'POST'})
                .then(resp => {
                    if (resp && resp.data && resp.data._status) {
                        let APIToken = resp.data.token;
                        localStorage.setItem('token', APIToken);
                        Axios.defaults.headers.common['Authorization'] = APIToken;
                        commit('auth_success', APIToken);
                    }
                    resolve(resp);
                })
                .catch(err => {
                    commit('auth_error');
                    localStorage.removeItem('token');
                    reject(err);
                });
        });
    },
    login({commit}, data) {
        let self = this;
        return new Promise((resolve, reject) => {
            commit('auth_request');
            var url = appConfig.baseAPIURL + '/fe/auth/login';

            Axios({url: url, data: data, method: 'POST'})
                .then(resp => {
                    let APIToken = resp.data.token;
                    localStorage.setItem('token', APIToken);
                    Axios.defaults.headers.common['Authorization'] = APIToken;
                    commit('auth_success', APIToken);
                    //self.$store.dispatch('loadVehicleMakeModels');
                    //self.$store.dispatch('loadJobs');s
                    //self.$store.dispatch('loadUserInfo');
                    //self.$store.dispatch('loadVendorInfo');
                    //self.$store.dispatch('loadBusinessTypes');
                    //self.$store.dispatch('loadDashboardSummary');
                    resolve(resp);
                })
                .catch(err => {
                    commit('auth_error');
                    localStorage.removeItem('token');
                    reject(err);
                });
        });
    },
    logout({commit}) {
        return new Promise((resolve, reject) => {
            console.log('logout');
            commit('logout');
            commit('card/logout');
            commit('estimate/logout');
            commit('invoice/logout');
            localStorage.removeItem('token');
            delete Axios.defaults.headers.common['Authorization'];
            document.location.replace(appConfig.homeURL + '/');
            resolve();
        });
    },
    loadPartsSearchLocation(context) {
        Axios.get('/fe/partsearch/get-company-locations')
            .then(response => {
                if (response.status == 200) {
                    context.commit('loadPartsSearchLocation', response.data.data);
                }
            });
    },
    loadMenu(context) {
        Axios.get('/fe/auth/menu')
            .then(response => {
                if (response.status == 200) {
                    context.commit('loadMenu', response.data);
                }
            });
    },
    loadVehiclesForCustom(context) {
        return;
        //Axios.get('/fe/vehicle/for-custom')
        //    .then(response => {
        //        context.commit('loadVehiclesForCustom', response.data);
        //    })
        //    .catch(error => {
        //        console.log(error);
        //    });
    },
    loadVehicleScheduleNumbers(context) {
        Axios.get('/fe/vehicle/schedule-numbers')
            .then(response => {
                context.commit('loadVehicleScheduleNumbers', response.data);
            })
            .catch(error => {
                console.log(error);
            });
    },
    loadVehicleMakeModels(context) {
        Axios.get('/fe/vehicle/make-models')
            .then(response => {
                context.commit('loadVehicleMakeModels', response.data);
            })
            .catch(error => {
                console.log(error);
            });
    },
    loadUsers(context) {
        Axios.get('/fe/users')
            .then(response => {
                context.commit('loadUsers', response.data.users);
            })
            .catch(error => {
                console.log(error);
            });
    },
    loadJobs(context) {
        Axios.get('/fe/parts/directory')
            .then(response => {
                context.commit('loadJobs', response.data);
            })
            .catch(error => {
                console.log(error);
            });
    },
    loadButterfly(context) {
        Axios.get('/fe/parts/butterfly')
            .then(response => {
                if (response.data._status) {
                    context.commit('loadButterfly', response.data.data);
                }
            })
            .catch(error => {
                console.log(error);
            });
    },
    setButterflyMatrixOrder(context, payload) {
        context.commit('setButterflyMatrixOrder', payload);
    },
    addToButterflyCustomMatrix(context, payload) {
        context.commit('addToButterflyCustomMatrix', payload);
    },
    addItemToJobs(context, payload) {
        console.log('addItemToJobs',payload);
        let type = payload.item.type;
        let obj ={}
        if (type == "RR" && payload.response && payload.response.newCustomRR && payload.response.newCustomRR.id){
            obj = payload.response.newCustomRR;
            obj.type = type;
        }else if (type == "Repair" && payload.response && payload.response.newCustomRepair && payload.response.newCustomRepair.id){
            obj = payload.response.newCustomRepair;
            obj.type = type;
        }else if (type == "Paint" && payload.response && payload.response.newCustomPaint && payload.response.newCustomPaint.id){
            obj = payload.response.newCustomPaint;
            obj.type = type;
        }else if (type == "Other" && payload.response && payload.response.newCustomOther && payload.response.newCustomOther.id){
            obj = payload.response.newCustomOther;
            obj.type = type;
        }
        else{
            // console.log('FALSE!!!!')
            return false;
        }
        context.commit('addItemToJobs', obj);
    },
    removeFromButterflyCustomMatrix(context, payload) {
        context.commit('removeFromButterflyCustomMatrix', payload);
    },
    removeItemFromJobs(context, payload) {
        context.commit('removeItemFromJobs', payload);
    },
    loadUserInfo(context) {
        Axios.get('/fe/user/info')
            .then(response => {
                context.commit('loadUserInfo', response.data);
            })
            .catch(error => {
                console.log(error);
            });
    },
    loadVendorInfo(context) {
        Axios.get('/fe/vendor/info')
            .then(response => {
                context.commit('loadVendorInfo', response.data);
            })
            .catch(error => {
                console.log(error);
            });
    },
    loadBusinessTypes(context) {
        Axios.get('/fe/business-type/list')
            .then(response => {
                context.commit('loadBusinessTypes', response.data);
            })
            .catch(error => {
                console.log(error);
            });
    },
    loadDashboardSummary(context) {
        Axios.get('/fe/dashboard/summary')
            .then(response => {
                context.commit('loadDashboardSummary', response.data);
            })
            .catch(error => {
                console.log(error);
            });
    },
    loadCustomerVehicles(context) {
        Axios.get('/fe/customer-vehicles')
            .then(response => {
                context.commit('loadCustomerVehicles', response.data);
            })
            .catch(error => {
                console.log(error);
            });
    },
    loadInsurances(context) {
        Axios.get('/fe/insurances')
            .then(response => {
                context.commit('loadInsurances', response.data);
            })
            .catch(error => {
                console.log(error);
            });
    },
    loadEstimateActivity({state, commit, dispatch}, payload) {
        let url = `/fe/estimate/activity/${payload.estimate_id}`;
        if (payload.sort_type) {
            url += '?sort_type=' + encodeURI(payload.sort_type);
        }
        return Axios.get(url)
            .then(response => {
                return response;
            })
            .catch(error => {
                return error.response;
            });
    },
    loadCardActivity({state, commit, dispatch}, payload) {
        let url = `/fe/card/activity/${payload.card_id}`;
        if (payload.sort_type) {
            url += '?sort_type=' + encodeURI(payload.sort_type);
        }
        return Axios.get(url)
            .then(response => {
                return response;
            })
            .catch(error => {
                return error.response;
            });
    },
    changeCategory({state, commit, dispatch}, payload) {
        return Axios.post(`/fe/card/changeImageCategory`, payload)
            .then(response => {
                return response;
            })
            .catch(error => {
                return error.response;
            });
    },
    sendActivityReplyMessage({state, commit, dispatch}, payload) {
        return Axios.post('/fe/email/activityReplyMessage', payload)
            .then(response => {
                return response;
            })
            .catch(error => {
                return error.response;
            });
    },
    loadCEStatuses({state, commit, dispatch}, payload) {
        return Axios.get(`/fe/card/ceStatuses`)
            .then(response => {
                return response;
            })
            .catch(error => {
                return error.response;
            });
    },
    addNewCEStatus({state, commit, dispatch}, payload) {
        return Axios.post('/fe/card/addNewCEStatus', {status_name: payload.status_name})
            .then(response => {
                return response;
            })
            .catch(error => {
                return error.response;
            });
    },
    deleteCEStatus({state, commit, dispatch}, payload) {
        return Axios.post(`/fe/card/deleteCEStatus`, {CEStatus_id: payload.CEStatus_id})
            .then(response => {
                return response;
            })
            .catch(error => {
                return error.response;
            });
    },
    copyFileFromEmail({state, commit, dispatch}, payload) {
        return Axios.post(`/fe/messages/copy/file`, payload)
            .then(response => {
                return response;
            })
            .catch(error => {
                return error.response;
            });
    },
    markAsReadCardNotification({state, commit, dispatch}, payload) {
        let cardId = payload;
        return Axios.post(`/fe/card/${cardId}/notifications/mark-as-read`, payload)
            .then(response => {
                dispatch('card/loadCards');
                dispatch('estimate/loadEstimates');
                return response;
            })
            .catch(error => {
                return error.response;
            });
    },
    markAsReadEstimateNotification({state, commit, dispatch}, payload) {
        let estimateId = payload;
        return Axios.post(`/fe/estimate/${estimateId}/notifications/mark-as-read`, payload)
            .then(response => {
                dispatch('card/loadCards');
                dispatch('estimate/loadEstimates');
                return response;
            })
            .catch(error => {
                return error.response;
            });
    },
    updateActivityViewedStatus({state, commit, dispatch}, payload) {
        return Axios.post(`/fe/card/activity/view`, payload)
            .then(response => {
                dispatch('card/loadCards');
                dispatch('estimate/loadEstimates');
                return response;
            })
            .catch(error => {
                return error.response;
            });
    },
    getActivityRead({state, commit, dispatch}, {activityArray}) {
        return new Promise((resolve) => {
            let taskIsRead = '';
            let taskCounter = 0;
            let emailIsRead = '';
            let emailCounter = 0;
            let externalCounter = 0;
            let externalIsRead = '';

            const receivedEmailArray = activityArray.filter(item => item.sort_type === 'Email' && item.activity_type === 'ER');
            const receivedExternalArray = activityArray.filter(item => item.sort_type === 'External');
            const receivedTaskArray = activityArray.filter(item => item.sort_type === 'Assignment');

            if (receivedEmailArray.length > 0) {
                receivedEmailArray.forEach((item, key) => {
                    if (item.sort_type === 'Email' && item.activity_type === 'ER' && item.viewed === '1') {
                        ++emailCounter;
                    }
                    if (key === receivedEmailArray.length - 1) {
                        if (emailCounter === receivedEmailArray.length) {
                            emailIsRead = 'emailsRead';
                        } else {
                            emailIsRead = 'unreadEmail';
                        }
                    }
                });
            } else {
                emailIsRead = 'noEmail';
            }

            if (receivedExternalArray.length > 0) {
                receivedExternalArray.forEach((item, key) => {
                    if (item.viewed === '1') {
                        ++externalCounter;
                    }
                    if (key === receivedExternalArray.length - 1) {
                        if (externalCounter === receivedExternalArray.length) {
                            externalIsRead = 'externalsRead';
                        } else {
                            externalIsRead = 'unreadExternals';
                        }
                    }
                });
            } else {
                externalIsRead = 'noExternal';
            }

            if (receivedTaskArray.length > 0) {
                receivedTaskArray.forEach((item, key) => {
                    if (item.viewed === '1') {
                        ++taskCounter;
                    }
                    if (key === receivedTaskArray.length - 1) {
                        if (taskCounter === receivedTaskArray.length) {
                            taskIsRead = 'tasksRead';
                        } else {
                            taskIsRead = 'unreadTask';
                        }
                    }
                });
            } else {
                taskIsRead = 'noTask';
            }

            resolve({emailIsRead: emailIsRead, externalIsRead: externalIsRead, externals: receivedExternalArray, isTaskAssigned: taskIsRead});
        });
    },

    addFileIdInCardEdit(context, id) {
        context.commit('addFileIdInCardEdit', id);
    },

    updateFileIdsInCardEdit(context, idArray) {
        context.commit('updateFileIdsInCardEdit', idArray);
    },

    clearFileIdsInCardEdit(context) {
        context.commit('clearFileIdsInCardEdit');
    },

    addFileInCardEdit(context, file) {
        context.commit('addFileInCardEdit', file);
    },

    removeFileInCardEditById(context, id) {
        context.commit('removeFileInCardEditById', id);
    },

    removeFileIdInCardEdit(context, id) {
        context.commit('removeFileIdInCardEdit', id);
    },

    unshiftFileInCardEdit(context, file) {
        context.commit('unshiftFileInCardEdit', file);
    },

    updateFiles(context, files) {
        context.commit('updateFiles', files);
    },

    updateDataInCardEdit(context, data) {
        context.commit('updateDataInCardEdit', data);
    },

    deleteUpdateDataByField(context, field) {
        context.commit('deleteUpdateDataByField', field);
    },

    clearUpdateDataByField(context, field) {
        context.commit('clearUpdateDataByField', field);
    },
    updateJustSeeMine({commit}, payload) {
        commit('setJustSeeMine', payload);
        return Axios.post(`/fe/user/set-just-see-mine`, {value: payload})
            .then(response => {
                return response;
            })
            .catch(error => {
                return error.response;
            });
    },

};

