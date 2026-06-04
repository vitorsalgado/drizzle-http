"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartiesAPI = void 0;
const core_1 = require("@drizzle-http/core");
const core_2 = require("@drizzle-http/core");
class PartiesAPI {
    parties(acronym) {
        return (0, core_2.noop)(acronym);
    }
}
__decorate([
    (0, core_1.GET)('/partidos'),
    (0, core_1.ContentType)(core_1.MediaTypes.APPLICATION_JSON),
    (0, core_1.Accept)(core_1.MediaTypes.APPLICATION_JSON),
    (0, core_1.Params)([(0, core_1.Query)('sigla')])
], PartiesAPI.prototype, "parties", null);
exports.PartiesAPI = PartiesAPI;
//# sourceMappingURL=app.api.js.map