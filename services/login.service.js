(function() {
	"use strict";

	var LoginService = function($rootScope, HttpService) {
		this.currentUser = null;

		/**
		* Login function: sends login request to backend using request configuration parameter
		* @param {object} requestsConfig Configuration data with properties:
		*  	{string} username Username 
		*  	{string} username Email 
		*  	{string} password Passowrd
		*  	{function} successCallback Function to called get when user is logged in 
		*  	{function} badUsernameCallback Function to get called when username wasn't found 
		*  	{function} emailNotFreeCallback Function to get called when email was found, so it's taken 
		*  	{function} badPasswordCallback Function to get called when username was found, but password is wrong
		* 	{function} unhandledCallback Function to get called when unexpected response was recieved
		* @return {void}
		*/
		this.checkCredentials = function(requestsConfig) {
			// Set default config
			requestsConfig = {
				// Request data
				username: requestsConfig.username ? requestsConfig.username : null, 
				email : requestsConfig.email ? requestsConfig.email : null, 
				password : requestsConfig.password ? requestsConfig.password : null, 
				// Callbacks
				successCallback: requestsConfig.successCallback ? requestsConfig.successCallback : function () {}, 
				usernameCallback: requestsConfig.usernameCallback ? requestsConfig.usernameCallback : function (status) {}, 
				emailCallback: requestsConfig.emailCallback ? requestsConfig.emailCallback : function (status) {}, 
				passwordCallback: requestsConfig.passwordCallback ? requestsConfig.passwordCallback : function (status) {}, 
				unhandledCallback: requestsConfig.unhandledCallback ? requestsConfig.unhandledCallback : function (data) {}
			};

			// Call httpService to login
			HttpService.getCredentialsStatus(requestsConfig.username, requestsConfig.email, requestsConfig.password).then(
				(result) => {
					console.log(result);
					requestsConfig.usernameCallback(result.data.usernameStatus);
					requestsConfig.emailCallback(result.data.emailStatus);	
					requestsConfig.passwordCallback(result.data.passwordStatus);	
					if (result.data.usernameStatus === true && result.data.passwordStatus === true) {
						console.info("Password for username '" + requestsConfig.username + "' is correct.");						
						requestsConfig.successCallback();
					}
				},
				(reason) => {
					console.error("Encountered a " + reason.status + " error. " + reason.data, reason);
					requestsConfig.unhandledCallback(reason);
				});
		}

		/**
		* Login function: sends registration request to backend using request configuration parameter
		* @param {object} requestsConfig Configuration data with properties:
		*  	{string} username Username 
		*  	{string} username Email 
		*  	{string} password Passowrd
		*  	{function} successCallback Function to called get when user is logged in 
		* 	{function} unhandledCallback Function to get called when unexpected response was recieved
		* @return {void}
		*/
		this.register = function(requestsConfig) {
			// Set default config
			requestsConfig = {
				// Request data
				username: requestsConfig.username ? requestsConfig.username : null, 
				email : requestsConfig.email ? requestsConfig.email : null, 
				password : requestsConfig.password ? requestsConfig.password : null, 
				// Callbacks
				successCallback: requestsConfig.successCallback ? requestsConfig.successCallback : function () {}, 
				failureCallback: requestsConfig.failureCallback ? requestsConfig.failureCallback : function () {},
				unhandledCallback: requestsConfig.unhandledCallback ? requestsConfig.unhandledCallback : function (data) {}
			};

			// Call httpService to register new user
			HttpService.getCredentialsStatus(requestsConfig.username, requestsConfig.email, requestsConfig.password).then(
				(result) => {
					requestsConfig.successCallback();
				},
				(reason) => {
					requestsConfig.failureCallback(reason);
				});				
		}

		/**
		* subscribe to event which closes the login panel
		*/
		this.subscribe = function(scope, callback) {
			var handler = $rootScope.$on('login-changed', callback);
			scope.$on('$destroy', handler);
		}

		/**
		* emit event to close login panel
		*/
		this.onRegistrationStart = function () {
			$rootScope.$emit('login-changed');			
		}

		/**
		* assign selected user and close login panel
		*/
		this.onLoggedIn = function(username) {
			this.currentUser = new User(username);			
			$rootScope.$emit('login-changed');
		}

		/**
		* send logout request
		*/
		this.logout = function() {
			HttpService.logout();
			this.currentUser = null;
		}
	}

	LoginService.$inject = ["$rootScope", "HttpService"];

	angular.module("app").service("LoginService", LoginService);
})();