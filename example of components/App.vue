<template>
  <div
      class="wrapper"
      id="app-wrapper"
      :class="[activeMainTemplateClass, {'is-visible': isLogin || isHome}]"
      v-show="isLoaded"
      :style="{backgroundColor: !isLoggedIn? '#212330':''}"
  >
    <!--    <RouterContainer v-else-if="!this.isLogoutAction || isRegisterOrLoginPage"></RouterContainer>-->
    <template v-if="isLoggedIn && !isHome && !isLogin && !isLogoutAction  && !isRegisterOrLoginPage">
      <SiteSidebar></SiteSidebar>
      <SiteHeader></SiteHeader>
      <SiteContent></SiteContent>
    </template>
    <!-- <HomePage v-else-if="!isLoggedIn && isHome"></HomePage> -->
    <!--<ForgotPage v-else-if="!isLoggedIn && isForgot"></ForgotPage>
    <ForgotUserDataPage v-else-if="!isLoggedIn && isForgotUserData"></ForgotUserDataPage>
    <PasswordResetPage v-else-if="!isLoggedIn && isResetPass"></PasswordResetPage>
    <ForgotPasswordPage v-else-if="!isLoggedIn && isForgotPass1"></ForgotPasswordPage>
    <ForgotPassUserDataPage v-else-if="!isLoggedIn && isForgotPass2"></ForgotPassUserDataPage>
    <RouterContainer v-else-if="!isLoggedIn && isRegisterRepairerSupplier"></RouterContainer>
    <RegisterPage v-else-if="!isLoggedIn && isRegister"></RegisterPage>
    <SupplierRegisterPage v-else-if="!isLoggedIn && isSupplierRegister"></SupplierRegisterPage>
    <InviteCustomer v-else-if="isInviteCustomer"></InviteCustomer>-->
    <!--<AuthLoginPage to v-else-if="!isLoggedIn"></AuthLoginPage>-->

    <RouterContainer v-else-if="(!isLoggedIn && !isLogoutAction) || isRegisterOrLoginPage"></RouterContainer>
  </div>
</template>

<script>
/* eslint-disable */
import Vue from 'vue'
import { mapGetters } from 'vuex'
import accounting from 'accounting'

import SiteHeader from './components/common/site-header'
import SiteSidebar from './components/common/site-sidebar'
import SiteContent from './components/common/site-content'
import AuthLoginPage from './views/auth/login'
import ForgotPage from './views/auth/forgot'
import ForgotUserDataPage from './views/auth/forgot-userdata'
import PasswordResetPage from './views/auth/password'
import ForgotPasswordPage from './views/auth/forgot_pass'
import ForgotPassUserDataPage from './views/auth/forgot_pass-userdata'
import RouterContainer from './views/container'
import InviteCustomer from './views/modal/invite-customer'
import RegisterPage from './views/auth/register/repairer/register'
import SupplierRegisterPage from './views/auth/register/supplier/register'
import ToastTemplate from './components/toastTemplate'
import Axios from 'axios'
import moment from 'moment'

import HomePage from './views/home/Home.vue'

import Vuelidate from 'vuelidate'

Vue.use(Vuelidate)

import { createToastInterface } from "vue-toastification";
import "vue-toastification/dist/index.css";
import newRequestForQuoteSound from './assets/audio/new-request-for-quote-sound.wav';
import updatePricedQuoteRequestSound from './assets/audio/update-priced-quote-request-sound.wav';

export default {
  name: 'app',
  components: {
    SiteHeader,
    SiteSidebar,
    SiteContent,
    HomePage,
    AuthLoginPage,
    ForgotPage,
    ForgotUserDataPage,
    PasswordResetPage,
    ForgotPasswordPage,
    ForgotPassUserDataPage,
    InviteCustomer,
    RouterContainer,
    RegisterPage,
    SupplierRegisterPage
  },
  data: function () {
    return {
      isLoaded: false,
      isUpdate: null,
      customToast: null,
      toastContent: {},
      toastOptions: {
        toastClassName: "my-custom-toast-class",
        timeout: false,
        closeButton: false,
        icon: false,
      },
    }
  },
  computed: {
    ...mapGetters({
      activeMainTemplateClass: 'getActiveMainTemplateClass',
      isLoggedIn: 'auth/isLoggedIn',
      isLogoutAction: 'auth/isLogoutAction',
      isSoundNoticeNewRfq: 'currentUser/isSoundNoticeNewRfq',
      isSoundNoticeUpdatedPriceRequest: 'currentUser/isSoundNoticeUpdatedPriceRequest',
      isPlayNotificationSound: 'currentUser/isPlayNotificationSound',
    }),
    isHome () {
      return this.$route.path == '/'
    },
    isLogin () {
      return this.$route.path == '/login'
    },
    isRegisterOrLoginPage () {
      return this.$route.path.includes('/register') || this.$route.path.includes('/auth') || this.$route.path === '/login'
    },
    isForgot () {
      return this.$router.history.current['path'].indexOf('forgot1') !== -1
    },
    isForgotUserData () {
      return this.$router.history.current['path'].indexOf('forgot2') !== -1
    },
    isResetPass () {
      return this.$router.history.current['path'].indexOf('reset-pass') !== -1
    },
    isForgotPass1 () {
      return (
          this.$router.history.current['path'].indexOf('forgot-pass1') !== -1
      )
    },
    isForgotPass2 () {
      return (
          this.$router.history.current['path'].indexOf('forgot-pass2') !== -1
      )
    },
    isInviteCustomer () {
      return (
          this.$router.history.current['path'].indexOf('invite-customer') !== -1
      )
    },
    isRegisterRepairerSupplier () {
      return (
          this.$router.history.current['path'].indexOf('invite-repairer') !== -1 ||
          this.$router.history.current['path'].indexOf('/register/repairer/') !== -1 ||
          this.$router.history.current['path'].indexOf('/register/supplier/') !== -1
      )
    },
    isRegister () {
      return (
          this.$router.history.current['path'].indexOf('repairer/register') !== -1
      )
    },
    isSupplierRegister () {
      return (
          this.$router.history.current['path'].indexOf('supplier/register') !== -1
      )
    }
  },
  methods: {
    loadNotices(timestamp){
      if (timestamp <= 0) {
        return;
      }

      Axios.get(`/ir/notices/${timestamp}`)
          .then(response => {
            if(response.data._status){
              _.forEach(response.data.notices, (notice, ind) => {
                setTimeout(() => {
                  this.toastContent.props = {
                    toastText: notice.text,
                    toastTitle: notice.title,
                  }

                  this.customToast(this.toastContent, this.toastOptions);
                  let audio = new Audio(updatePricedQuoteRequestSound);

                  if (this.$store.getters['currentUser/isUserTypeRepairer']) {
                    if (this.isSoundNoticeUpdatedPriceRequest && notice.title === 'Pricing update received') {
                      let interval = setInterval(() => {
                        audio.play()
                            .then(() => {
                              clearInterval(interval)
                            })
                            .catch(e => {
                              // console.log(e, 'e')
                            })
                      }, 1000)
                    }
                  } else {
                    if (this.isSoundNoticeUpdatedPriceRequest && notice.title === 'Pricing update requested') {
                      let interval = setInterval(() => {
                        audio.play()
                            .then(() => {
                              clearInterval(interval)
                            })
                            .catch(e => {
                              // console.log(e, 'e')
                            })
                      }, 1000)
                    }
                  }
                }, 100 + 500 * ind);
              })
            }
          })
          .catch(e => console.error(e))
    },
    checkUpdate () {
      if (this.$store.getters['auth/isLoggedIn']) {
        let timestamp = this.$store.getters['updater/lastTimestamp']
        //console.log('update=', timestamp);
        Axios.get('/ir/update/' + timestamp)
            .then(response => {
              if (response.data && response.data._status) {
                this.$store.dispatch('updater/setLastTimestamp', response.data._timestamp, { root: true })
                if (response.data.update) {
                  if (response.data.update.rfq && response.data.update.rfq > 0) {
                    if (this.$store.getters['currentUser/isUserTypeRepairer']) {
                      this.$store.dispatch('repairer/rfq/init', response.data.update.timestamp, { root: true })
                    }
                    if (this.$store.getters['currentUser/isUserTypeSupplier']) {
                      this.$store.dispatch('supplier/rfq/init', response.data.update.timestamp, { root: true })
                    }
                  }

                  if (response.data.update.noticesCount > 0) {
                    this.loadNotices(response.data.update.timestamp);
                  }

                  if (response.data.update.rfqToSupplierCurrentlyViewing) {
                    this.$store.commit('supplier/rfq/setViewingUsers', response.data.update.rfqToSupplierCurrentlyViewing)
                  }
                    if (response.data.update.credits && response.data.update.credits > 0) {
                    // console.log('Credits timestamp', response.data.update.timestamp)
                    if (this.$store.getters['currentUser/isUserTypeRepairer']) {
                      this.$store.dispatch('repairer/credit/init', response.data.update.timestamp, { root: true })
                    }
                    if (this.$store.getters['currentUser/isUserTypeSupplier']) {
                      this.$store.dispatch('supplier/credit/init', response.data.update.timestamp, { root: true })
                    }
                  }

                  if (response.data.update.orders && response.data.update.orders > 0) {
                    if (this.$store.getters['currentUser/isUserTypeRepairer']) {
                      this.$store.dispatch('repairer/order/init', {
                        timestamp: response.data.update.timestamp,
                        isFromUpdate: true,
                      }, { root: true })
                    }
                    if (this.$store.getters['currentUser/isUserTypeSupplier']) {
                      this.$store.dispatch('supplier/order/init', response.data.update.timestamp, { root: true })
                    }
                  }

                  if (response.data.update.suppliers && response.data.update.suppliers > 0) {
                    if (this.$store.getters['currentUser/isUserTypeRepairer']) {
                      this.$store.dispatch('repairer/supplier/init', response.data.update.timestamp, { root: true })
                    }
                  }

                  if (response.data.update.users && response.data.update.users > 0) {
                    this.$store.dispatch('users/fetchAllUsers', {}, {root: true})
                  }

                  if (response.data.update.company && response.data.update.company > 0) {
                    this.$store.dispatch('currentCompany/loadCompanyInfo', {}, {root: true})
                  }
                }
              }
            })
      }
    }
  },
  created: function () {
    if (!this.isHome && !this.isLoggedIn && !this.$route.path.includes('/register') && !this.$route.path.includes('/auth') && this.$route.path !== '/login' && !this.$route.path.includes('/reset-password')) {
      this.$router.push('/')
    }

    let vm = this
    this.$http.interceptors.response.use(undefined, function (err) {
      // console.log('ERROR:', err, err.response);
      return new Promise(function (resolve, reject) {
        if (err.response.status === 401) {
          NProgress.start();
          let wrapper = document.getElementById('app-wrapper');
          wrapper.style.opacity = 0;
          setTimeout(() => {
            vm.$store.dispatch('auth/logout')
          }, 500)
        }
        throw err
      })
    })

    if (this.$store.getters['auth/isLoggedIn']) {
      if (this.isHome || this.isLogin) {
        if (this.$store.getters['currentUser/isUserTypeSupplier']) {
          this.$router.push('/s')
        } else {
          this.$router.push('/r')
        }
      }
      //if (this.isHome || this.isLogin) {
      //  if (this.$store.getters["currentUser/isUserTypeSupplier"]) {
      //    this.$router.push("/s");
      //  }else{
      //    this.$router.push("/home22");
      //  }
      //
      //}
      this.$store.dispatch('initAppAfterLogin')
    }
    if (this.activeMainTemplateClass || !this.isLoggedIn) this.isLoaded = true

    //  console.log(vm.isUpdate);
    clearInterval(vm.isUpdate)
    if (!vm.isUpdate) {
      this.isUpdate = setInterval(() => {
        vm.checkUpdate()
      }, 5000)
    }
  },
  watch: {
    activeMainTemplateClass (val) {
      if (val) this.isLoaded = true
    },
    isPlayNotificationSound: {
      handler (val) {
        if (val) {
          let audio = new Audio(newRequestForQuoteSound);
          let interval = setInterval(() => {
            audio.play()
                .then(() => {
                  clearInterval(interval)
                })
                .catch(e => {
                  // console.log(e, 'e')
                })
          }, 1000)
        }
      },
      immediate: true
    }
  },

  mounted () {
    this.$nextTick(() => {
      this.isLoaded = true
    })

    this.toastContent = {
      component: ToastTemplate,
      props: {
        toastText: '',
        toastTitle: '',
      },
      listeners: {
        dismissAll: () => this.customToast.clear()
      }
    }
    this.customToast = createToastInterface(this.toastOptions)
  }
}
Vue.filter('formatMoney', function (value) {
  return accounting.formatMoney(value)
})
Vue.filter('formatDate', function (value, format = 'DD/MM/YYYY') {
//  console.log('formatDate', value, format)
  if (!value) {
    return ''
  }
  return moment(value).format(format)
})
Vue.filter('striphtml', function (value) {
  var div = document.createElement('div')
  div.innerHTML = value
  var text = div.textContent || div.innerText || ''
  return text
})
</script>

<style lang="scss">
@import "./styles/style-views";
@import './styles/style-components';
</style>

<style>
.Vue-Toastification__container {
  z-index: 99999999999;
}
.my-custom-toast-class {
  background: linear-gradient(135deg, #23a6ab 0%, #1ba9af 49.12%, #29BBC1 100%);
  font-size: 16px;
}

.my-custom-toast-class button {
  color: #d3d3d3;
  font-size: 14px;
}

.my-custom-toast-class button:hover,
.my-custom-toast-class .close-toast:hover {
  color: white;
}

.my-custom-toast-class .close-toast {
  font-size: 20px;
  color: #d3d3d3;
}

.my-custom-toast-class .toast-text {
  margin-top: 10px;
  font-size: 13px;
}
</style>

<style lang="scss">
.wrapper {
  visibility: hidden;
  opacity: 0;
  transition: opacity 100ms ease-out;
  transition-delay: 200ms;
}

.wrapper.is-visible,
.wrapper.theme-repairer,
.wrapper.theme-supplier,
.wrapper.theme-home {
  visibility: visible;
  opacity: 1;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
