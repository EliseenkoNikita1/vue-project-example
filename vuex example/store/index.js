import Vue from 'vue';
import Vuex from 'vuex';
import modules from './modules';

import {States} from './states';
import {Getters} from './getters';
import {Mutations} from './mutations';
import {Actions} from './actions';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: States,
  getters: Getters,
  actions: Actions,
  mutations: Mutations,
  modules,
});

for (const moduleName of Object.keys(modules)) {
  //if (modules[moduleName].actions.init) {
  //  store.dispatch(`${moduleName}/init`)
  //}
}

console.log('modules',modules);

export default store;
