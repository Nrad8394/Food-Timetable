"use strict";
exports.__esModule = true;
exports.handleApiError = void 0;
var sonner_1 = require("sonner");
exports.handleApiError = function (error, customMessage) {
    var _a, _b;
    // Network or axios cancellation errors
    if (!error.response) {
        sonner_1.toast.error(error.message || 'Network error occurred');
        return;
    }
    var _c = error.response, status = _c.status, data = _c.data;
    // Handle different HTTP status codes
    switch (status) {
        case 400:
            // Handle validation errors
            if (typeof data === 'object') {
                Object.entries(data).forEach(function (_a) {
                    var key = _a[0], value = _a[1];
                    var message = Array.isArray(value) ? value[0] : value;
                    sonner_1.toast.error(key + ": " + message);
                });
            }
            else {
                sonner_1.toast.error(customMessage || data.detail || 'Invalid request');
            }
            break;
        case 401:
            sonner_1.toast.error('Session expired. Please login again');
            // You might want to trigger a logout or redirect here
            break;
        case 403:
            if (data.error) {
                sonner_1.toast.error(data.error);
            }
            else {
                sonner_1.toast.error('You do not have permission to perform this action');
            }
            break;
        case 404:
            sonner_1.toast.error(customMessage || 'Resource not found');
            break;
        case 429:
            sonner_1.toast.error('Too many requests. Please try again later');
            break;
        case 500:
            sonner_1.toast.error('Server error occurred. Please try again later');
            break;
        default:
            sonner_1.toast.error(customMessage || data.detail || 'An unexpected error occurred');
    }
    // Log error for debugging
    console.error('API Error:', {
        status: status,
        data: data,
        endpoint: (_a = error.config) === null || _a === void 0 ? void 0 : _a.url,
        method: (_b = error.config) === null || _b === void 0 ? void 0 : _b.method
    });
};
