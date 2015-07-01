var WebService=function() {
WebService.initializeBase(this);
this._timeout = 0;
this._userContext = null;
this._succeeded = null;
this._failed = null;
}
WebService.prototype={
_get_path:function() {
 var p = this.get_path();
 if (p) return p;
 else return WebService._staticInstance.get_path();},
ElasticSearchSuggest:function(q,index,succeededCallback, failedCallback, userContext) {
return this._invoke(this._get_path(), 'ElasticSearchSuggest',false,{q:q,index:index},succeededCallback,failedCallback,userContext); },
ElasticSearch:function(q,page,facets,size,indexes,endpoint,succeededCallback, failedCallback, userContext) {
return this._invoke(this._get_path(), 'ElasticSearch',false,{q:q,page:page,facets:facets,size:size,indexes:indexes,endpoint:endpoint},succeededCallback,failedCallback,userContext); },
GroupedElasticSearch:function(q,page,facets,size,indexes,endpoint,succeededCallback, failedCallback, userContext) {
return this._invoke(this._get_path(), 'GroupedElasticSearch',false,{q:q,page:page,facets:facets,size:size,indexes:indexes,endpoint:endpoint},succeededCallback,failedCallback,userContext); },
Search:function(q,indexes,succeededCallback, failedCallback, userContext) {
return this._invoke(this._get_path(), 'Search',false,{q:q,indexes:indexes},succeededCallback,failedCallback,userContext); },
SearchOnderzoeksinstituut:function(q,succeededCallback, failedCallback, userContext) {
return this._invoke(this._get_path(), 'SearchOnderzoeksinstituut',false,{q:q},succeededCallback,failedCallback,userContext); },
Address:function(tokenPassed,postalCode,houseNumber,succeededCallback, failedCallback, userContext) {
return this._invoke(this._get_path(), 'Address',false,{tokenPassed:tokenPassed,postalCode:postalCode,houseNumber:houseNumber},succeededCallback,failedCallback,userContext); },
GetCompanies:function(tokenPassed,query,succeededCallback, failedCallback, userContext) {
return this._invoke(this._get_path(), 'GetCompanies',false,{tokenPassed:tokenPassed,query:query},succeededCallback,failedCallback,userContext); },
GetCities:function(tokenPassed,query,succeededCallback, failedCallback, userContext) {
return this._invoke(this._get_path(), 'GetCities',false,{tokenPassed:tokenPassed,query:query},succeededCallback,failedCallback,userContext); },
GetLocationUser:function(tokenPassed,succeededCallback, failedCallback, userContext) {
return this._invoke(this._get_path(), 'GetLocationUser',false,{tokenPassed:tokenPassed},succeededCallback,failedCallback,userContext); },
GetCourse:function(parameters,succeededCallback, failedCallback, userContext) {
return this._invoke(this._get_path(), 'GetCourse',false,{parameters:parameters},succeededCallback,failedCallback,userContext); },
GetExam:function(parameters,succeededCallback, failedCallback, userContext) {
return this._invoke(this._get_path(), 'GetExam',false,{parameters:parameters},succeededCallback,failedCallback,userContext); },
GetLocationInformation:function(location,currentPageTitle,succeededCallback, failedCallback, userContext) {
return this._invoke(this._get_path(), 'GetLocationInformation',false,{location:location,currentPageTitle:currentPageTitle},succeededCallback,failedCallback,userContext); },
GetCourseWizardFacets:function(steps,succeededCallback, failedCallback, userContext) {
return this._invoke(this._get_path(), 'GetCourseWizardFacets',false,{steps:steps},succeededCallback,failedCallback,userContext); },
GetCourseWizardTotal:function(steps,succeededCallback, failedCallback, userContext) {
return this._invoke(this._get_path(), 'GetCourseWizardTotal',false,{steps:steps},succeededCallback,failedCallback,userContext); }}
WebService.registerClass('WebService',Sys.Net.WebServiceProxy);
WebService._staticInstance = new WebService();
WebService.set_path = function(value) { WebService._staticInstance.set_path(value); }
WebService.get_path = function() { return WebService._staticInstance.get_path(); }
WebService.set_timeout = function(value) { WebService._staticInstance.set_timeout(value); }
WebService.get_timeout = function() { return WebService._staticInstance.get_timeout(); }
WebService.set_defaultUserContext = function(value) { WebService._staticInstance.set_defaultUserContext(value); }
WebService.get_defaultUserContext = function() { return WebService._staticInstance.get_defaultUserContext(); }
WebService.set_defaultSucceededCallback = function(value) { WebService._staticInstance.set_defaultSucceededCallback(value); }
WebService.get_defaultSucceededCallback = function() { return WebService._staticInstance.get_defaultSucceededCallback(); }
WebService.set_defaultFailedCallback = function(value) { WebService._staticInstance.set_defaultFailedCallback(value); }
WebService.get_defaultFailedCallback = function() { return WebService._staticInstance.get_defaultFailedCallback(); }
WebService.set_enableJsonp = function(value) { WebService._staticInstance.set_enableJsonp(value); }
WebService.get_enableJsonp = function() { return WebService._staticInstance.get_enableJsonp(); }
WebService.set_jsonpCallbackParameter = function(value) { WebService._staticInstance.set_jsonpCallbackParameter(value); }
WebService.get_jsonpCallbackParameter = function() { return WebService._staticInstance.get_jsonpCallbackParameter(); }
WebService.set_path("/CMSPages/Webservice.asmx");
WebService.ElasticSearchSuggest= function(q,index,onSuccess,onFailed,userContext) {WebService._staticInstance.ElasticSearchSuggest(q,index,onSuccess,onFailed,userContext); }
WebService.ElasticSearch= function(q,page,facets,size,indexes,endpoint,onSuccess,onFailed,userContext) {WebService._staticInstance.ElasticSearch(q,page,facets,size,indexes,endpoint,onSuccess,onFailed,userContext); }
WebService.GroupedElasticSearch= function(q,page,facets,size,indexes,endpoint,onSuccess,onFailed,userContext) {WebService._staticInstance.GroupedElasticSearch(q,page,facets,size,indexes,endpoint,onSuccess,onFailed,userContext); }
WebService.Search= function(q,indexes,onSuccess,onFailed,userContext) {WebService._staticInstance.Search(q,indexes,onSuccess,onFailed,userContext); }
WebService.SearchOnderzoeksinstituut= function(q,onSuccess,onFailed,userContext) {WebService._staticInstance.SearchOnderzoeksinstituut(q,onSuccess,onFailed,userContext); }
WebService.Address= function(tokenPassed,postalCode,houseNumber,onSuccess,onFailed,userContext) {WebService._staticInstance.Address(tokenPassed,postalCode,houseNumber,onSuccess,onFailed,userContext); }
WebService.GetCompanies= function(tokenPassed,query,onSuccess,onFailed,userContext) {WebService._staticInstance.GetCompanies(tokenPassed,query,onSuccess,onFailed,userContext); }
WebService.GetCities= function(tokenPassed,query,onSuccess,onFailed,userContext) {WebService._staticInstance.GetCities(tokenPassed,query,onSuccess,onFailed,userContext); }
WebService.GetLocationUser= function(tokenPassed,onSuccess,onFailed,userContext) {WebService._staticInstance.GetLocationUser(tokenPassed,onSuccess,onFailed,userContext); }
WebService.GetCourse= function(parameters,onSuccess,onFailed,userContext) {WebService._staticInstance.GetCourse(parameters,onSuccess,onFailed,userContext); }
WebService.GetExam= function(parameters,onSuccess,onFailed,userContext) {WebService._staticInstance.GetExam(parameters,onSuccess,onFailed,userContext); }
WebService.GetLocationInformation= function(location,currentPageTitle,onSuccess,onFailed,userContext) {WebService._staticInstance.GetLocationInformation(location,currentPageTitle,onSuccess,onFailed,userContext); }
WebService.GetCourseWizardFacets= function(steps,onSuccess,onFailed,userContext) {WebService._staticInstance.GetCourseWizardFacets(steps,onSuccess,onFailed,userContext); }
WebService.GetCourseWizardTotal= function(steps,onSuccess,onFailed,userContext) {WebService._staticInstance.GetCourseWizardTotal(steps,onSuccess,onFailed,userContext); }
var gtc = Sys.Net.WebServiceProxy._generateTypedConstructor;
Type.registerNamespace('NCOI.Library.CompanyName.Domain');
if (typeof(NCOI.Library.CompanyName.Domain.Company) === 'undefined') {
NCOI.Library.CompanyName.Domain.Company=gtc("NCOI.Library.CompanyName.Domain.Company");
NCOI.Library.CompanyName.Domain.Company.registerClass('NCOI.Library.CompanyName.Domain.Company');
}
Type.registerNamespace('NCOI.Library.Course.Domain');
if (typeof(NCOI.Library.Course.Domain.City) === 'undefined') {
NCOI.Library.Course.Domain.City=gtc("NCOI.Library.Course.Domain.City");
NCOI.Library.Course.Domain.City.registerClass('NCOI.Library.Course.Domain.City');
}
Type.registerNamespace('NCOI.Library.Utils.Models');
if (typeof(NCOI.Library.Utils.Models.CourseParameters) === 'undefined') {
NCOI.Library.Utils.Models.CourseParameters=gtc("NCOI.Library.Utils.Models.CourseParameters");
NCOI.Library.Utils.Models.CourseParameters.registerClass('NCOI.Library.Utils.Models.CourseParameters');
}
if (typeof(NCOI.Library.Utils.Models.CourseResponse) === 'undefined') {
NCOI.Library.Utils.Models.CourseResponse=gtc("NCOI.Library.Utils.Models.CourseResponse");
NCOI.Library.Utils.Models.CourseResponse.registerClass('NCOI.Library.Utils.Models.CourseResponse');
}
if (typeof(NCOI.Library.Utils.Models.ExamParameters) === 'undefined') {
NCOI.Library.Utils.Models.ExamParameters=gtc("NCOI.Library.Utils.Models.ExamParameters");
NCOI.Library.Utils.Models.ExamParameters.registerClass('NCOI.Library.Utils.Models.ExamParameters');
}
if (typeof(NCOI.Library.Utils.Models.ExamResponse) === 'undefined') {
NCOI.Library.Utils.Models.ExamResponse=gtc("NCOI.Library.Utils.Models.ExamResponse");
NCOI.Library.Utils.Models.ExamResponse.registerClass('NCOI.Library.Utils.Models.ExamResponse');
}
Type.registerNamespace('NCOI.Library.Wizard');
if (typeof(NCOI.Library.Wizard.CourseWizardStep) === 'undefined') {
NCOI.Library.Wizard.CourseWizardStep=gtc("NCOI.Library.Wizard.CourseWizardStep");
NCOI.Library.Wizard.CourseWizardStep.registerClass('NCOI.Library.Wizard.CourseWizardStep');
}
if (typeof(NCOI.Library.Wizard.CourseWizardResult) === 'undefined') {
NCOI.Library.Wizard.CourseWizardResult=gtc("NCOI.Library.Wizard.CourseWizardResult");
NCOI.Library.Wizard.CourseWizardResult.registerClass('NCOI.Library.Wizard.CourseWizardResult');
}
