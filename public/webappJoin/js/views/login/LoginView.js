define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/login/LoginTemplatePin.html'
], function($, _, backbone, LoginTemplate) {
    var LoginView = Backbone.View.extend({
        el: $("#engageApp"),
        loginViewTemplate: _.template(LoginTemplate),
        render: function() {
            this.$el.html(this.loginViewTemplate);
            console.log("Login View render");
            $("#inputPinSuccess").focus()
        }
    });
    return LoginView;
});


