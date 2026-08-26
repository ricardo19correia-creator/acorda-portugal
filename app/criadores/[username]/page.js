'use client';
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CreatorProfilePage;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var background_fx_1 = require("@/components/background-fx");
var site_header_1 = require("@/components/site-header");
var site_footer_1 = require("@/components/site-footer");
var CreatorProfileView_1 = require("@/components/creators/CreatorProfileView");
var CreatorsCommentsDrawer_1 = require("@/components/creators/CreatorsCommentsDrawer");
var ReportPostModal_1 = require("@/components/creators/ReportPostModal");
var creators_service_1 = require("@/lib/creators-service");
function CreatorProfilePage() {
    var _this = this;
    var params = (0, navigation_1.useParams)();
    var rawUsername = (params === null || params === void 0 ? void 0 : params.username) || 'jogador';
    var username = decodeURIComponent(rawUsername);
    var _a = (0, react_1.useState)(null), activeCommentPost = _a[0], setActiveCommentPost = _a[1];
    var _b = (0, react_1.useState)(false), isCommentsDrawerOpen = _b[0], setIsCommentsDrawerOpen = _b[1];
    var _c = (0, react_1.useState)(null), activeReportPost = _c[0], setActiveReportPost = _c[1];
    var _d = (0, react_1.useState)(false), isReportModalOpen = _d[0], setIsReportModalOpen = _d[1];
    var handleLike = function (postId) { return __awaiter(_this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, creators_service_1.togglePostLike)(postId)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleSave = function (postId) {
        (0, creators_service_1.togglePostSave)(postId);
    };
    var handleOpenComments = function (post) {
        setActiveCommentPost(post);
        setIsCommentsDrawerOpen(true);
    };
    var handleVotePoll = function (postId, optionId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, creators_service_1.voteOnPoll)(postId, optionId)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var handleVoteSuggestion = function (postId, vote) {
        (0, creators_service_1.voteOnSuggestion)(postId, vote);
    };
    var handleReport = function (post) {
        setActiveReportPost(post);
        setIsReportModalOpen(true);
    };
    return (<div className="relative min-h-screen bg-transparent flex flex-col">
      <background_fx_1.BackgroundFx variant="about"/>

      <div className="relative z-20 flex-1 flex flex-col">
        <site_header_1.SiteHeader />

        <main className="flex-1 pb-16">
          <div className="mx-auto max-w-4xl px-3 sm:px-6 lg:px-8 pt-6">
            <CreatorProfileView_1.CreatorProfileView username={username} onLike={handleLike} onSave={handleSave} onOpenComments={handleOpenComments} onVotePoll={handleVotePoll} onVoteSuggestion={handleVoteSuggestion} onReport={handleReport}/>
          </div>
        </main>

        <CreatorsCommentsDrawer_1.CreatorsCommentsDrawer post={activeCommentPost} isOpen={isCommentsDrawerOpen} onClose={function () {
            setIsCommentsDrawerOpen(false);
            setActiveCommentPost(null);
        }} onCommentAdded={function () { }}/>

        <ReportPostModal_1.ReportPostModal post={activeReportPost} isOpen={isReportModalOpen} onClose={function () {
            setIsReportModalOpen(false);
            setActiveReportPost(null);
        }}/>

        <site_footer_1.SiteFooter />
      </div>
    </div>);
}
