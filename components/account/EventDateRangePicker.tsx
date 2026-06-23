"use client";

import { useMemo } from "react";
import { ui } from "@/utils/ui";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

interface DateParts {
  day: number;
  month: number;
  year: number;
}

interface EventDateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  disabled?: boolean;
  labels: {
    startDate: string;
    endDate: string;
    day: string;
    month: string;
    year: string;
  };
  inputClassName?: string;
  labelClassName?: string;
}

function getCurrentYear(): number {
  return new Date().getFullYear();
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function parseIsoDate(value: string): DateParts | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

function toIsoDate(parts: DateParts): string {
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return `${parts.year}-${month}-${day}`;
}

function clampDateParts(parts: DateParts): DateParts {
  const maxDay = daysInMonth(parts.year, parts.month);
  return {
    ...parts,
    day: Math.min(Math.max(parts.day, 1), maxDay),
  };
}

function defaultParts(): DateParts {
  const now = new Date();
  return { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() };
}

function getParts(value: string): DateParts {
  return clampDateParts(parseIsoDate(value) ?? defaultParts());
}

function compareIsoDates(left: string, right: string): number {
  if (!left || !right) return 0;
  return left.localeCompare(right);
}

interface DateSelectRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  fieldLabels: { day: string; month: string; year: string };
  inputClassName: string;
  labelClassName: string;
}

function DateSelectRow({
  label,
  value,
  onChange,
  disabled,
  fieldLabels,
  inputClassName,
  labelClassName,
}: DateSelectRowProps) {
  const parts = getParts(value);
  const currentYear = getCurrentYear();
  const years = Array.from({ length: 6 }, (_, index) => currentYear + index);
  const maxDay = daysInMonth(parts.year, parts.month);
  const days = Array.from({ length: maxDay }, (_, index) => index + 1);

  const updateParts = (next: Partial<DateParts>) => {
    onChange(toIsoDate(clampDateParts({ ...parts, ...next })));
  };

  return (
    <div className="block">
      <span className={labelClassName}>{label}</span>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <label className="block">
          <span className="sr-only">{fieldLabels.day}</span>
          <select
            value={parts.day}
            disabled={disabled}
            onChange={(event) => updateParts({ day: Number(event.target.value) })}
            className={inputClassName}
            aria-label={`${label} ${fieldLabels.day}`}
          >
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">{fieldLabels.month}</span>
          <select
            value={parts.month}
            disabled={disabled}
            onChange={(event) => updateParts({ month: Number(event.target.value) })}
            className={inputClassName}
            aria-label={`${label} ${fieldLabels.month}`}
          >
            {MONTH_LABELS.map((monthLabel, index) => (
              <option key={monthLabel} value={index + 1}>
                {monthLabel}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">{fieldLabels.year}</span>
          <select
            value={parts.year}
            disabled={disabled}
            onChange={(event) => updateParts({ year: Number(event.target.value) })}
            className={inputClassName}
            aria-label={`${label} ${fieldLabels.year}`}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

export function EventDateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled = false,
  labels,
  inputClassName,
  labelClassName,
}: EventDateRangePickerProps) {
  const inputClass = inputClassName ?? ui.input;
  const fieldLabelClass =
    labelClassName ??
    "mb-2 block font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/45 dark:text-white/45";

  const calendarMonth = useMemo(() => {
    const startParts = parseIsoDate(startDate);
    if (startParts) {
      return { year: startParts.year, month: startParts.month };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }, [startDate]);

  const calendarCells = useMemo(() => {
    const firstWeekday = new Date(calendarMonth.year, calendarMonth.month - 1, 1).getDay();
    const totalDays = daysInMonth(calendarMonth.year, calendarMonth.month);
    const cells: Array<{ day: number | null; iso: string | null }> = [];

    for (let index = 0; index < firstWeekday; index += 1) {
      cells.push({ day: null, iso: null });
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const iso = toIsoDate({ year: calendarMonth.year, month: calendarMonth.month, day });
      cells.push({ day, iso });
    }

    return cells;
  }, [calendarMonth]);

  const rangeStart = startDate && endDate ? startDate : "";
  const rangeEnd = startDate && endDate ? endDate : "";
  const hasValidRange =
    Boolean(rangeStart && rangeEnd) && compareIsoDates(rangeStart, rangeEnd) <= 0;

  return (
    <div className="flex flex-col gap-4">
      <DateSelectRow
        label={labels.startDate}
        value={startDate}
        onChange={onStartDateChange}
        disabled={disabled}
        fieldLabels={{ day: labels.day, month: labels.month, year: labels.year }}
        inputClassName={inputClass}
        labelClassName={fieldLabelClass}
      />

      <DateSelectRow
        label={labels.endDate}
        value={endDate}
        onChange={onEndDateChange}
        disabled={disabled}
        fieldLabels={{ day: labels.day, month: labels.month, year: labels.year }}
        inputClassName={inputClass}
        labelClassName={fieldLabelClass}
      />

      <div
        className="rounded-[28px] border border-[#222222]/10 bg-[#F9F9F9] p-4 dark:border-white/10 dark:bg-white/5"
        aria-hidden
      >
        <p className="mb-3 text-center font-sans text-xs font-medium uppercase tracking-wide text-[#222222]/55 dark:text-white/55">
          {MONTH_LABELS[calendarMonth.month - 1]} {calendarMonth.year}
        </p>

        <div className="grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((weekday) => (
            <div
              key={weekday}
              className="py-1 text-center font-sans text-[10px] font-medium uppercase tracking-wide text-[#222222]/40 dark:text-white/40"
            >
              {weekday}
            </div>
          ))}

          {calendarCells.map((cell, index) => {
            if (!cell.day || !cell.iso) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const inRange =
              hasValidRange &&
              compareIsoDates(cell.iso, rangeStart) >= 0 &&
              compareIsoDates(cell.iso, rangeEnd) <= 0;
            const isStart = cell.iso === rangeStart;
            const isEnd = cell.iso === rangeEnd;

            return (
              <div
                key={cell.iso}
                className={`flex aspect-square items-center justify-center rounded-full font-sans text-xs font-medium ${
                  inRange
                    ? "bg-[#222222]/12 text-[#222222] dark:bg-white/15 dark:text-white"
                    : "text-[#222222]/45 dark:text-white/45"
                } ${isStart || isEnd ? "bg-[#222222] text-white dark:bg-white dark:text-black" : ""}`}
              >
                {cell.day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
