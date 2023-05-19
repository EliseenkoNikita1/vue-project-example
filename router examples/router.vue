<script>
import Vue from 'vue';
import VueRouter from 'vue-router';

import RouterDashboard from './components/dashboard/dashboard';

import RouterCardsNew from './components/cards/cards-new';
import RouterCards from './components/cards/cards';
import RouterCardsEdit from './components/cards/cards-edit';

import RouterEstimatesEdit from './components/estimates/estimates-edit';
import RouterEstimateOptionsSendToSuppliers from './components/estimates/options/estimate-options-send-to-suppliers';
import RouterEstimateOptionsSendToPartssearch from './components/estimates/options/estimate-options-send-to-partssearch';
import RouterEstimateOptionsSendToClaimlinq from './components/estimates/options/estimate-options-send-to-claimlinq';
import RouterEstimateOptionsSendToCustomers from './components/estimates/options/estimate-options-send-to-customers';
import RouterEstimateOptionsSendToInsurers from './components/estimates/options/estimate-options-send-to-insurers';
import RouterEstimateOptionsParseIbodyshopPdf from './components/estimates/options/estimate-options-parse-ibodyshop-pdf';
import RouterEstimates from './components/estimates/estimates';
import RouterEstimatesTest1 from './components/estimates/tests/estimates-test-1';
import RouterEstimatesTest2 from './components/estimates/tests/estimates-test-2';
import RouterEstimatesTest3 from './components/estimates/tests/estimates-test-3';
import RouterEstimatesTest4 from './components/estimates/tests/estimates-test-4';

import RouterEstimatesTemplate from './components/estimates/estimates-templates';

import RouterSuppliersNew from './components/suppliers-new';
import RouterSuppliers from './components/suppliers';
import RouterSuppliersEdit from './components/suppliers-edit';

import RouterCustomersNew from './components/customers-new';
import RouterCustomers from './components/customers';
import RouterCustomersEdit from './components/customers-edit';

import RouterInsurers from './components/insurers';
import RouterInsurersEdit from './components/insurers-edit';

import RouterAssessors from './components/assessors';

import RouterInvoices from './components/invoices/invoices';
import RouterInvoiceView from './components/invoices/invoice-view';
import RouterInvoiceExcess from './components/invoices/invoice-excess';
import RouterInvoiceNew from './components/invoices/invoice-new';
import RouterInvoiceExcessNew from './components/invoices/invoice-excess-new';
import RouterInvoiceCreate from './components/invoices/invoice-create';

import RouterReports from './components/reports/reports';

import RouterBoardsVehicleIn from './components/boards/vehicle-in';
import RouterBoardsDeparture from './components/boards/departure';
import RouterInvoiceOptionsSendToCustomer from './components/invoices/options/invoice-options-send-to-customer';
import RouterInvoiceOptionsSendToInsurer from './components/invoices/options/invoice-options-send-to-insurer';
import RouterInvoiceOptionsMarkAsPaid from './components/invoices/options/invoice-options-mark-as-paid';
import RouterPlanner from './components/boards/planner';

import RouterProfile from './components/profile';
import RouterBusiness from './components/business';
import RouterSettings from './components/settings';
import RouterUsersNew from './components/users-new';
import RouterUsersEdit from './components/users-edit';

import RouterAuthByCode from './components/auth/by-code';
import RouterAuthLogin from './components/auth/login';

import RouterForgotUserNamePage from './components/auth/forgotName';
import RouterForgotPasswordPage from './components/auth/forgotPassword';
import RouterSupportUserNamePage from './components/auth/forgotUserData';
import RouterSupportPasswordPage from './components/auth/forgotPassUserData';
import RouterResetPasswordPage from './components/auth/passwordReset';
import RouterAuthLogout from './components/auth/logout';
import RouterRegisterPage from './components/auth/register/register';
import SelectPlan from './components/auth/register/select-plan';
import RouterAccountCreated from './components/auth/register/account-created';
import RouterFoundProblem from './components/auth/register/found-problem';
import RouterFindAccount from './components/auth/register/find-account';
import RouterEmailConfirmed from './components/auth/register/email-confirmed';
import RouterPagesOfRegistration from "./components/auth/register/PagesOfRegistration";

import RouterParts from './components/parts';
import RouterPartView from './components/part-view';

Vue.use(VueRouter);

export default new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    {path: '/', component: RouterDashboard, meta: {requiresAuth: true}},
    {path: '/estimates', component: RouterEstimates, meta: {requiresAuth: true}},
    {path: '/estimates-test-1', component: RouterEstimatesTest1, meta: {requiresAuth: true}},
    {path: '/estimates-test-2', component: RouterEstimatesTest2, meta: {requiresAuth: true}},
    {path: '/estimates-test-3', component: RouterEstimatesTest3, meta: {requiresAuth: true}},
    {path: '/estimates-test-4', component: RouterEstimatesTest4, meta: {requiresAuth: true}},
    {path: '/estimates/view/:estimate_id', component: RouterEstimatesEdit, name: 'EstimatesEdit', meta: {requiresAuth: true}},
    {path: '/estimates/view/:estimate_id/options/sendToSuppliers', name: 'sendToSupplier', component: RouterEstimateOptionsSendToSuppliers, meta: {requiresAuth: true}},
    {path: '/estimates/view/:estimate_id/options/sendToPartssearch', name: 'sendToPartssearch', component: RouterEstimateOptionsSendToPartssearch, meta: {requiresAuth: true}},
    {path: '/estimates/view/:estimate_id/options/sendToClaimlinq', name: 'sendToClaimlinq', component: RouterEstimateOptionsSendToClaimlinq, meta: {requiresAuth: true}},
    {path: '/estimates/view/:estimate_id', component: RouterEstimatesEdit, meta: {requiresAuth: true}},
    {path: '/estimates/view/:estimate_id/options/sendToCustomers', name: 'sendToCustomer', component: RouterEstimateOptionsSendToCustomers, meta: {requiresAuth: true}},
    {path: '/estimates/view/:estimate_id/options/sendToInsurers', name: 'sendToInsurer', component: RouterEstimateOptionsSendToInsurers, meta: {requiresAuth: true}},
    {path: '/estimates/view/:estimate_id/options/parseExternalPdf', name: 'parseExternalPdf', component: RouterEstimateOptionsParseIbodyshopPdf, meta: {requiresAuth: true}},
    {path: '/estimates-template', component: RouterEstimatesTemplate, meta: {requiresAuth: true}},

    {path: '/cards', component: RouterCards, name: 'Cards', meta: {requiresAuth: true}},
    {path: '/cards/new', component: RouterCardsNew, meta: {requiresAuth: true}},
    {path: '/cards/view/:card_id', component: RouterCardsEdit, name: 'CardsEdit', meta: {requiresAuth: true}},

    {path: '/parts', component: RouterParts, meta: {requiresAuth: true}},
    {path: '/parts/ordered/:estimate_id', component: RouterPartView, meta: {requiresAuth: true}},

    {path: '/suppliers', component: RouterSuppliers, meta: {requiresAuth: true}},
    {path: '/suppliers/new', component: RouterSuppliersNew, meta: {requiresAuth: true}},
    {path: '/suppliers/view/:supplier_id', component: RouterSuppliersEdit, meta: {requiresAuth: true}},

    {path: '/customers', component: RouterCustomers, meta: {requiresAuth: true}},
    {path: '/customers/new', component: RouterCustomersNew, meta: {requiresAuth: true}},
    {path: '/customers/view/:customer_id', component: RouterCustomersEdit, meta: {requiresAuth: true}},

    {path: '/insurers', component: RouterInsurers, meta: {requiresAuth: true}},
    {path: '/insurers/view/:insurer_id', component: RouterInsurersEdit, meta: {requiresAuth: true}},

    {path: '/assessors', component: RouterAssessors, meta: {requiresAuth: true}},

    {path: '/invoices', component: RouterInvoices, meta: {requiresAuth: true}},
    {path: '/invoice/view/:invoice_id', name: 'InvoiceView', component: RouterInvoiceView, meta: {requiresAuth: true}},
    {path: '/invoice/view/:invoice_id/excess', name: 'InvoiceExcessView', component: RouterInvoiceExcess, meta: {requiresAuth: true}},
    {path: '/invoice/new/:card_id', component: RouterInvoiceNew, meta: {requiresAuth: true}},
    {path: '/invoice/create', component: RouterInvoiceCreate, meta: {requiresAuth: true}},
    {path: '/invoice/new/:card_id/excess', component: RouterInvoiceExcessNew, meta: {requiresAuth: true}},
    {path: '/invoice/create', component: RouterInvoiceCreate, meta: {requiresAuth: true}},
    {path: '/invoice/view/:invoice_id/options/sendToCustomer', name: 'invoiceSendToCustomer', component: RouterInvoiceOptionsSendToCustomer, meta: {requiresAuth: true}},
    {path: '/invoice/view/:invoice_id/options/sendToInsurer', name: 'invoiceSendToInsurer', component: RouterInvoiceOptionsSendToInsurer, meta: {requiresAuth: true}},
    {path: '/invoice/view/:invoice_id/options/markAsPaid', name: 'invoiceMarkAsPaid', component: RouterInvoiceOptionsMarkAsPaid, meta: {requiresAuth: true}},
    {path: '/invoice/view/:invoice_id/excess/options/markAsPaid', name: 'invoiceMarkAsPaidForExcess', component: RouterInvoiceOptionsMarkAsPaid, meta: {requiresAuth: true}},

    {path: '/reports', component: RouterReports, meta: {requiresAuth: true}},

    {path: '/boards/vehicle-in', component: RouterBoardsVehicleIn, meta: {requiresAuth: true}},
    {path: '/boards/departure', component: RouterBoardsDeparture, meta: {requiresAuth: true}},
    {path: '/boards/planner', component: RouterPlanner, meta: {requiresAuth: true}},

    {path: '/profile', component: RouterProfile, meta: {requiresAuth: true}},
    {path: '/business', component: RouterBusiness, meta: {requiresAuth: true}},

    {path: '/settings', component: RouterSettings, meta: {requiresAuth: true}},
    {path: '/settings/:tab', name: 'settings', component: RouterSettings, meta: {requiresAuth: true}},
    {path: '/settings/integrations/:tab', name: 'integrations', component: RouterSettings, meta: {requiresAuth: true}},
    {path: '/settings/billing/:tab', name: 'billing', component: RouterSettings, meta: {requiresAuth: true}},
    {path: '/settings/business-profile/:tab', name: 'business', component: RouterSettings, meta: {requiresAuth: true}},
    {path: '/settings/users/new', component: RouterUsersNew, meta: {requiresAuth: true}},
    {path: '/settings/users/view/:user_id', component: RouterUsersEdit, meta: {requiresAuth: true}},

    {path: '/login', component: RouterAuthLogin, name: "AuthLogin", meta: {requiresAuth: false}},
    {path: '/auth/:authCode', component: RouterAuthByCode, name: 'AuthByCode', props: true, meta: {requiresAuth: false}},
    {path: '/auth/forgot/username', component: RouterForgotUserNamePage},
    {path: '/auth/forgot/username/support', component: RouterSupportUserNamePage},
    {path: '/auth/forgot/password/support', component: RouterSupportPasswordPage},
    {path: '/auth/forgot/password', component: RouterForgotPasswordPage},
    {path: '/reset-password/:code', component: RouterResetPasswordPage},
    {path: '/logout', component: RouterAuthLogout},
    {path: '/register', component: RouterRegisterPage, name: 'Register', props: true},
    {path: '/registration/:support_pack', component: RouterRegisterPage},
    {path: '/select-plan', component: SelectPlan, name: 'SelectPlan', props: true},
    {path: '/register/account-created', component: RouterAccountCreated},
    {path: '/register/found-problem', component: RouterFoundProblem},
    {path: '/register/find-account', component: RouterFindAccount},
    {path: '/register/email-confirmed', component: RouterEmailConfirmed},
    {path: '/register/registration', component: RouterPagesOfRegistration, name: 'Registration', props: true},
    {path: '*', redirect: '/login'}
  ],
  scrollBehavior(to, from, savedPosition) {
    return {x: 0, y: 0};
  }
});
</script>


