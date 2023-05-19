import _ from "lodash";
import Vue from "vue";

export const Mutations = {
    loadPartsSearchLocation(state, ui) {
      state.partsSearchLocations = ui;
    },
    setPlannerBoardType(state, ui) {
        state.plannerBoardType = ui;
    },
    loadUsers(state, ui) {
        state.users = ui;
    },
    auth_request(state) {
        state.status = 'loading';
    },
    auth_success(state, token) {
        state.status = 'success';
        state.token = token;
    },
    auth_error(state) {
        state.status = 'error';
    },
    logout(state) {
        state.isLogout = true;
        state.status = '';
        state.token = '';
    },

    setCardFilter(state, filter) {
        state.filter.card = filter;
    },
    setInvoiceFilter(state, filter) {
        state.filter.invoice = filter;
    },
    setJustSeeMine(state, val) {
        state.userInfo.isJustSeeMine = val;
    },
    setEstimateFilter(state, filter) {
        state.filter.estimate = filter;
    },

    loadVehiclesForCustom(state, mm) {
        //state.vehiclesForCustom = mm;
    },
    loadVehicleScheduleNumbers(state, mm) {
        state.vehicleScheduleNumbers = mm;
    },
    loadVehicleMakeModels(state, mm) {
        state.vehicleMakeModels = mm;
    },
    loadJobs(state, jbs) {
        state.jobs = jbs;
    },
    loadButterfly(state, data) {
        if (data && data.bodies) {
            state.butterfly.bodies = data.bodies;
        }
        if (data && data.categories) {
            state.butterfly.categories = data.categories;
        }
        if (data && data.customMatrix) {
            state.butterfly.customMatrix = data.customMatrix;
        }
        if (data && data.matrix) {
            state.butterfly.matrix = data.matrix;
        }
        if (data && data.names) {
            state.butterfly.names = data.names;
        }
        if (data && data.matrixOrder) {
            state.butterfly.matrixOrder = data.matrixOrder;
        }
    },
    setButterflyMatrixOrder(state, data) {
        if (!state.butterfly.matrixOrder) {
            Vue.set(state.butterfly, 'matrixOrder', {});
        }
        if (!state.butterfly.matrixOrder[data.bodyId]) {
            Vue.set(state.butterfly.matrixOrder, data.bodyId, {});
        }
        if (!state.butterfly.matrixOrder[data.bodyId][data.type]) {
            Vue.set(state.butterfly.matrixOrder[data.bodyId], data.type, {});
        }
        if (!state.butterfly.matrixOrder[data.bodyId][data.type][data.categoryId]) {
            Vue.set(state.butterfly.matrixOrder[data.bodyId][data.type], data.categoryId, []);
        }
        state.butterfly.matrixOrder[data.bodyId][data.type][data.categoryId] = data.sort;
    },
    addToButterflyCustomMatrix(state, data) {
        if (!state.butterfly.customMatrix) {
            Vue.set(state.butterfly, 'customMatrix', {});
        }
        if (!state.butterfly.customMatrix[data.bodyId]) {
            Vue.set(state.butterfly.customMatrix, data.bodyId, {});
        }
        if (!state.butterfly.customMatrix[data.bodyId][data.type]) {
            Vue.set(state.butterfly.customMatrix[data.bodyId], data.type, {});
        }
        if (!state.butterfly.customMatrix[data.bodyId][data.type][data.categoryId]) {
            Vue.set(state.butterfly.customMatrix[data.bodyId][data.type], data.categoryId, []);
        }
        state.butterfly.customMatrix[data.bodyId][data.type][data.categoryId].unshift(data);
    },
    addItemToJobs(state, item) {
        console.log('addItemToJobs',item);
        let type = item.type
        if (!state.jobs[type].Custom) {
            Vue.set(state.jobs[type],'Custom',{});
        }
        item.prt = _.toUpper(item.prt);
        Vue.set( state.jobs[type].Custom,item.prt,item);
        let newCustomObj=Object.assign({}, state.jobs[type].Custom)
        Vue.set(state.jobs[type],'Custom',newCustomObj);
    },
    removeFromButterflyCustomMatrix(state, data) {
        if (!state.butterfly.customMatrix) {
            return;
        }
        if (!state.butterfly.customMatrix[data.bodyId]) {
            return;
        }
        if (!state.butterfly.customMatrix[data.bodyId][data.type]) {
            return;
        }
        if (!state.butterfly.customMatrix[data.bodyId][data.type][data.categoryId]) {
            return;
        }
        state.butterfly.customMatrix[data.bodyId][data.type][data.categoryId] = _.remove(state.butterfly.customMatrix[data.bodyId][data.type][data.categoryId], function (i) {
            return Number(i.id) != Number(data.id);
        });
    },
    removeItemFromJobs(state, item){
        console.log('removeItemFromJobs', item);
        let type = item.type
        if (state.jobs[type] && state.jobs[type].Custom) {
            state.jobs[type].Custom = _.omit(state.jobs[type]['Custom'], _.toUpper(item.prt));
        }
    },
    loadUserInfo(state, ui) {
        state.userInfo = ui;
    },
    loadMenu(state, ui) {
        state.menu = ui;
    },
    loadVendorInfo(state, ui) {
        state.vendorInfo = ui;
    },
    loadBusinessTypes(state, ui) {
        state.businessTypes = ui;
    },
    loadDashboardSummary(state, ui) {
        state.dashboardSummary = ui;
    },
    loadCustomerVehicles(state, ui) {
        state.customerVehicles = ui;
    },
    loadInsurances(state, ui) {
        state.insurers = ui.insurers;
        state.assessors = ui.assessors;
        state.insurances = ui.insurances;
        console.log(state.insurers);
    },

    addFileIdInCardEdit(state, id) {
        state.fileIdsInCardEdit.push(id);
    },

    updateFileIdsInCardEdit(state, idArray) {
        state.fileIdsInCardEdit = idArray;
    },

    clearFileIdsInCardEdit(state) {
        state.fileIdsInCardEdit = [];
    },

    addFileInCardEdit(state, file) {
        state.filesInCardEdit.push(file);
    },

    removeFileIdInCardEdit(state, id) {
        state.fileIdsInCardEdit.splice(id, 1);
    },

    removeFileInCardEditById(state, id) {
        state.filesInCardEdit.splice(id, 1);
    },

    unshiftFileInCardEdit(state, file) {
        state.filesInCardEdit.unshift(file);
    },

    updateFiles(state, files) {
        state.filesInCardEdit = files;
    },

    updateDataInCardEdit(state, {uid, v}) {
        state.updateData[uid] = v;
    },

    deleteUpdateDataByField(state, field) {
        delete state.updateData[field];
    },

    clearUpdateDataByField(state, field) {
        state.updateData[field] = null;
    }
};
