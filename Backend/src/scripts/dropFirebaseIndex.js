"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importDefault(require("mongoose"));
var dotenv_1 = require("dotenv");
// Load environment variables
(0, dotenv_1.config)();
function dropFirebaseIndex() {
    return __awaiter(this, void 0, void 0, function () {
        var mongoUri, db, usersCollection, error_1, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mercury';
                    return [4 /*yield*/, mongoose_1.default.connect(mongoUri)];
                case 1:
                    _a.sent();
                    console.log('Connected to MongoDB');
                    db = mongoose_1.default.connection.db;
                    if (!db) {
                        throw new Error('Failed to get database instance');
                    }
                    usersCollection = db.collection('users');
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    // Drop the firebaseUid index
                    return [4 /*yield*/, usersCollection.dropIndex('firebaseUid_1')];
                case 3:
                    // Drop the firebaseUid index
                    _a.sent();
                    console.log('Successfully dropped firebaseUid index');
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.log('Index firebaseUid_1 might not exist:', error_1.message);
                    return [3 /*break*/, 5];
                case 5: return [4 /*yield*/, usersCollection.updateMany({}, { $unset: { firebaseUid: "" } })];
                case 6:
                    result = _a.sent();
                    console.log("Updated ".concat(result.modifiedCount, " documents - removed firebaseUid field"));
                    return [4 /*yield*/, mongoose_1.default.disconnect()];
                case 7:
                    _a.sent();
                    console.log('Disconnected from MongoDB');
                    process.exit(0);
                    return [3 /*break*/, 9];
                case 8:
                    error_2 = _a.sent();
                    console.error('Error:', error_2);
                    process.exit(1);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// Run the migration
dropFirebaseIndex();
