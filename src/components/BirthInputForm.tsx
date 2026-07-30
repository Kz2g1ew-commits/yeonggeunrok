"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, Compass, LockKeyhole, Settings2 } from "lucide-react";
import type { BirthInput } from "@/types/bazi";
import { calculateFourPillars } from "@/lib/calendar/calculateFourPillars";
import { analyzeSpiritualRoots } from "@/lib/spiritual-root/analyzeSpiritualRoots";
import { setCurrentAnalysis } from "@/lib/analysisStore";

const CITIES = [
  { id: "seoul", name: "대한민국 · 서울", country: "대한민국", timezone: "Asia/Seoul", longitude: 126.978 },
  { id: "busan", name: "대한민국 · 부산", country: "대한민국", timezone: "Asia/Seoul", longitude: 129.076 },
  { id: "tokyo", name: "일본 · 도쿄", country: "일본", timezone: "Asia/Tokyo", longitude: 139.692 },
  { id: "shanghai", name: "중국 · 상하이", country: "중국", timezone: "Asia/Shanghai", longitude: 121.474 },
  { id: "new-york", name: "미국 · 뉴욕", country: "미국", timezone: "America/New_York", longitude: -74.006 },
  { id: "los-angeles", name: "미국 · 로스앤젤레스", country: "미국", timezone: "America/Los_Angeles", longitude: -118.244 },
  { id: "london", name: "영국 · 런던", country: "영국", timezone: "Europe/London", longitude: -0.128 },
  { id: "sydney", name: "호주 · 시드니", country: "호주", timezone: "Australia/Sydney", longitude: 151.209 },
] as const;

const initialInput: BirthInput = {
  judgmentMode: "generous",
  calendarType: "solar", isLeapMonth: false,
  year: 1995, month: 5, day: 15, hour: 12, minute: 0,
  timezone: "Asia/Seoul", country: "대한민국", city: "서울", longitude: 126.978,
  longitudeIsApproximate: true, gender: "unspecified", applyLateZi: false,
  applyTrueSolarTime: false, timeAccuracy: "exact",
  shensha: { enabled: true, huagai: true, guimen: true, yima: true },
};

export function BirthInputForm() {
  const [input, setInput] = useState<BirthInput>(initialInput);
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const setNumber = (key: "year" | "month" | "day" | "hour" | "minute", value: string) => {
    setInput((current) => ({ ...current, [key]: Number(value) }));
  };

  const chooseCity = (id: string) => {
    const city = CITIES.find((item) => item.id === id);
    if (!city) return;
    setInput((current) => ({
      ...current, city: city.name.split(" · ")[1], country: city.country,
      timezone: city.timezone, longitude: city.longitude, longitudeIsApproximate: true,
    }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    startTransition(() => {
      try {
        const calculation = calculateFourPillars(input);
        const analysis = analyzeSpiritualRoots(input, calculation);
        setCurrentAnalysis({ input, calculation, analysis });
        router.push("/result");
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "입력값을 다시 확인해 주세요.");
      }
    });
  };

  return (
    <form onSubmit={submit} className="surface overflow-hidden">
      <div className="border-b border-white/6 px-5 py-5 sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="eyebrow">Birth chart</span>
            <h2 className="display-serif mt-2 text-2xl font-semibold tracking-[-.04em]">출생 정보를 새기다</h2>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-[#62c6a5]/20 bg-[#62c6a5]/6 px-3 py-1.5 text-[11px] font-bold text-[#83d3b8]">
            <LockKeyhole size={12} /> 브라우저 계산
          </span>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-7">
        <fieldset>
          <legend className="mb-2 text-xs font-bold text-[#9badb5]">영근 발현 기준</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {([
              { mode: "generous", title: "유연 판정 · 기본", description: "영근이 있다는 전제로 오행 수와 품질을 판정" },
              { mode: "balanced", title: "균형 판정 · 약 15%", description: "순천·역천 도맥 점수 47.0 이상 발현" },
              { mode: "strict", title: "엄격 판정 · 약 1%", description: "극희귀 도맥 점수 62.4 이상 발현" },
            ] as const).map((option) => (
              <button key={option.mode} type="button" aria-pressed={input.judgmentMode === option.mode}
                onClick={() => setInput((current) => ({ ...current, judgmentMode: option.mode }))}
                className={`rounded-xl border p-3 text-left transition ${input.judgmentMode === option.mode ? "border-[#d8b66a]/55 bg-[#d8b66a]/10" : "border-white/8 bg-black/10 hover:border-white/18"}`}>
                <strong className={input.judgmentMode === option.mode ? "text-[#efd48d]" : "text-[#cbd5d8]"}>{option.title}</strong>
                <span className="mt-1 block text-[11px] leading-5 text-[#7f939b]">{option.description}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-5 text-[#728991]">세 모드 모두 발현 후에는 같은 오행 점수와 품질 분포를 사용합니다. 천영근 → 변이영근 → 이영근 → 삼영근 → 사영근 → 오영근 순으로 왼쪽일수록 순도가 높습니다.</p>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-xs font-bold text-[#9badb5]">달력 기준</legend>
          <div className="segmented">
            {(["solar", "lunar"] as const).map((calendarType) => (
              <button key={calendarType} type="button" aria-pressed={input.calendarType === calendarType}
                onClick={() => setInput((current) => ({ ...current, calendarType, isLeapMonth: calendarType === "solar" ? false : current.isLeapMonth }))}>
                {calendarType === "solar" ? "양력 陽曆" : "음력 陰曆"}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-3 gap-3">
          <label className="form-label">출생 연도<input className="form-control" type="number" min="1900" max="2100" value={input.year} onChange={(e) => setNumber("year", e.target.value)} required /></label>
          <label className="form-label">월<input className="form-control" type="number" min="1" max="12" value={input.month} onChange={(e) => setNumber("month", e.target.value)} required /></label>
          <label className="form-label">일<input className="form-control" type="number" min="1" max="31" value={input.day} onChange={(e) => setNumber("day", e.target.value)} required /></label>
        </div>

        {input.calendarType === "lunar" && (
          <label className="check-row surface-soft p-3"><input type="checkbox" checked={input.isLeapMonth} onChange={(e) => setInput((current) => ({ ...current, isLeapMonth: e.target.checked }))} /><span><strong className="block text-[#e8ecec]">윤달로 입력</strong>해당 연도에 실제 윤달이 있는지 계산 시 검증합니다.</span></label>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="form-label"><span className="flex items-center gap-1.5"><Clock3 size={13} />출생 시간</span><input className="form-control" type="number" min="0" max="23" value={input.hour} onChange={(e) => setNumber("hour", e.target.value)} required /></label>
          <label className="form-label">출생 분<input className="form-control" type="number" min="0" max="59" value={input.minute} onChange={(e) => setNumber("minute", e.target.value)} required /></label>
        </div>

        <label className="form-label"><span className="flex items-center gap-1.5"><Compass size={13} />출생 도시</span>
          <select className="form-control" value={CITIES.find((city) => city.timezone === input.timezone && city.longitude === input.longitude)?.id ?? "seoul"} onChange={(e) => chooseCity(e.target.value)}>
            {CITIES.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
          </select>
          <span className="text-[11px] font-normal text-[#728991]">도시 중심 경도는 진태양시 선택 시 근사값으로 사용됩니다.</span>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="form-label">시간대
            <select className="form-control" value={input.timezone} onChange={(e) => setInput((current) => ({ ...current, timezone: e.target.value }))}>
              {[...new Set(CITIES.map((city) => city.timezone))].map((zone) => <option key={zone}>{zone}</option>)}
            </select>
          </label>
          <label className="form-label">시간 정확도
            <select className="form-control" value={input.timeAccuracy} onChange={(e) => setInput((current) => ({ ...current, timeAccuracy: e.target.value as BirthInput["timeAccuracy"] }))}>
              <option value="exact">정확함</option><option value="approximate">약 ±30분</option><option value="unknown">불확실함</option>
            </select>
          </label>
        </div>

        <button type="button" className="flex items-center justify-between border-y border-white/6 py-3 text-sm font-bold text-[#c7d2d6]" onClick={() => setAdvanced((value) => !value)} aria-expanded={advanced}>
          <span className="flex items-center gap-2"><Settings2 size={16} className="text-[#d8b66a]" /> 고급 계산 설정</span><span className="text-[#71858e]">{advanced ? "접기" : "펼치기"}</span>
        </button>

        {advanced && <div className="grid gap-4 surface-soft p-4">
          <label className="check-row"><input type="checkbox" checked={input.applyLateZi} onChange={(e) => setInput((current) => ({ ...current, applyLateZi: e.target.checked }))} /><span><strong className="text-[#e7ecec]">야자시 적용</strong><br />23시 이후의 일주를 다음 날로 봅니다.</span></label>
          <label className="check-row"><input type="checkbox" checked={input.applyTrueSolarTime} onChange={(e) => setInput((current) => ({ ...current, applyTrueSolarTime: e.target.checked }))} /><span><strong className="text-[#e7ecec]">진태양시 적용</strong><br />경도차와 균시차 근사값을 일주·시주에 반영합니다.</span></label>
          {input.applyTrueSolarTime && <label className="form-label">출생지 경도 (동경 + / 서경 −)
            <input className="form-control" type="number" min="-180" max="180" step="0.001" value={input.longitude ?? ""} onChange={(e) => setInput((current) => ({ ...current, longitude: Number(e.target.value), longitudeIsApproximate: false }))} required />
          </label>}
          <label className="form-label">성별 (선택)
            <select className="form-control" value={input.gender} onChange={(e) => setInput((current) => ({ ...current, gender: e.target.value as BirthInput["gender"] }))}><option value="unspecified">선택 안 함</option><option value="female">여성</option><option value="male">남성</option></select>
          </label>
          <label className="check-row"><input type="checkbox" checked={input.shensha.enabled} onChange={(e) => setInput((current) => ({ ...current, shensha: { ...current.shensha, enabled: e.target.checked } }))} /><span><strong className="text-[#e7ecec]">신살 부가 성향 사용</strong><br />영근 수에는 영향을 주지 않습니다.</span></label>
          {input.shensha.enabled && <div className="flex flex-wrap gap-4 pl-7 text-xs text-[#aab9bf]">
            {(["huagai", "guimen", "yima"] as const).map((key) => <label key={key} className="flex items-center gap-1.5"><input type="checkbox" checked={input.shensha[key]} onChange={(e) => setInput((current) => ({ ...current, shensha: { ...current.shensha, [key]: e.target.checked } }))} />{key === "huagai" ? "화개살" : key === "guimen" ? "귀문관살" : "역마살"}</label>)}
          </div>}
        </div>}

        {error && <div role="alert" className="rounded-xl border border-[#d96d62]/30 bg-[#d96d62]/8 p-3 text-sm text-[#f1aaa3]">{error}</div>}

        <button className="primary-button w-full" disabled={pending}>{pending ? "명식을 펼치는 중…" : <><span>영근 판정하기</span><ArrowRight size={18} /></>}</button>
        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-[#71858e]"><CheckCircle2 size={12} />입력 정보는 서버·데이터베이스·브라우저 저장소에 저장하지 않습니다.</p>
      </div>
    </form>
  );
}
