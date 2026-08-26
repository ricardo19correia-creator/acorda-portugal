'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorsCategoriesBar = CreatorsCategoriesBar;
var react_1 = require("react");
var creators_service_1 = require("@/lib/creators-service");
var utils_1 = require("@/lib/utils");
function CreatorsCategoriesBar(_a) {
    var selectedCategory = _a.selectedCategory, onSelectCategory = _a.onSelectCategory, _b = _a.categoryCounts, categoryCounts = _b === void 0 ? {} : _b;
    return (<div className="w-full">
      {/* Scroll horizontal no mobile, flex-wrap no desktop */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar sm:flex-wrap">
        {/* Botão "Todas" */}
        <button type="button" onClick={function () { return onSelectCategory('todas'); }} className={(0, utils_1.cn)('flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm', selectedCategory === 'todas'
            ? 'border-emerald-400 bg-emerald-500/25 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/50'
            : 'border-white/10 bg-slate-900/80 text-slate-400 hover:border-white/20 hover:bg-slate-800 hover:text-white')}>
          <span className="text-sm">✨</span>
          <span>Todas</span>
          {categoryCounts['todas'] !== undefined && (<span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-black text-slate-300">
              {categoryCounts['todas']}
            </span>)}
        </button>

        {/* 9 Categorias Oficiais */}
        {creators_service_1.CREATOR_CATEGORIES.map(function (cat) {
            var isSelected = selectedCategory === cat.slug;
            var count = categoryCounts[cat.slug];
            return (<button key={cat.slug} type="button" onClick={function () { return onSelectCategory(cat.slug); }} title={cat.tagline} className={(0, utils_1.cn)('flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm', isSelected
                    ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/40 font-black'
                    : 'border-white/10 bg-slate-900/80 text-slate-400 hover:border-white/25 hover:bg-slate-800 hover:text-white')}>
              <span className="text-sm">{cat.icon}</span>
              <span>{cat.name}</span>
              {count !== undefined && count > 0 && (<span className={(0, utils_1.cn)('rounded-full px-1.5 py-0.5 text-[10px] font-black', isSelected
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-white/10 text-slate-300')}>
                  {count}
                </span>)}
            </button>);
        })}
      </div>
    </div>);
}
