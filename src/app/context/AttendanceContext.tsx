import React, { createContext, useContext, useState, ReactNode } from "react";

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  department: string;
  position: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: "hadir" | "terlambat" | "izin" | "sakit" | "alpha";
  notes?: string;
  workHours?: number;
}

interface AttendanceContextType {
  records: AttendanceRecord[];
  checkIn: (userId: string, userName: string, department: string, position: string) => void;
  checkOut: (userId: string) => void;
  getTodayRecord: (userId: string) => AttendanceRecord | null;
  getUserRecords: (userId: string) => AttendanceRecord[];
  addLeave: (userId: string, userName: string, department: string, position: string, type: "izin" | "sakit", notes: string) => void;
}

const AttendanceContext = createContext<AttendanceContextType | null>(null);

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split("T")[0];
const formatTime = (d: Date) =>
  d.toTimeString().split(" ")[0].substring(0, 5);

function getDaysBack(days: number) {
  const d = new Date(today);
  d.setDate(d.getDate() - days);
  return formatDate(d);
}

const INITIAL_RECORDS: AttendanceRecord[] = [
  // Budi Santoso - last 14 days
  { id: "r1", userId: "2", userName: "Budi Santoso", department: "Kreatif", position: "Desainer Grafis", date: getDaysBack(0), checkIn: null, checkOut: null, status: "hadir" },
  { id: "r2", userId: "2", userName: "Budi Santoso", department: "Kreatif", position: "Desainer Grafis", date: getDaysBack(1), checkIn: "08:05", checkOut: "17:02", status: "hadir", workHours: 8.95 },
  { id: "r3", userId: "2", userName: "Budi Santoso", department: "Kreatif", position: "Desainer Grafis", date: getDaysBack(2), checkIn: "08:12", checkOut: "17:10", status: "hadir", workHours: 8.97 },
  { id: "r4", userId: "2", userName: "Budi Santoso", department: "Kreatif", position: "Desainer Grafis", date: getDaysBack(3), checkIn: "09:15", checkOut: "17:05", status: "terlambat", workHours: 7.83 },
  { id: "r5", userId: "2", userName: "Budi Santoso", department: "Kreatif", position: "Desainer Grafis", date: getDaysBack(4), checkIn: null, checkOut: null, status: "izin", notes: "Urusan keluarga" },
  { id: "r6", userId: "2", userName: "Budi Santoso", department: "Kreatif", position: "Desainer Grafis", date: getDaysBack(7), checkIn: "08:00", checkOut: "17:00", status: "hadir", workHours: 9 },
  { id: "r7", userId: "2", userName: "Budi Santoso", department: "Kreatif", position: "Desainer Grafis", date: getDaysBack(8), checkIn: "08:03", checkOut: "17:05", status: "hadir", workHours: 9.03 },
  { id: "r8", userId: "2", userName: "Budi Santoso", department: "Kreatif", position: "Desainer Grafis", date: getDaysBack(9), checkIn: null, checkOut: null, status: "sakit", notes: "Demam" },
  { id: "r9", userId: "2", userName: "Budi Santoso", department: "Kreatif", position: "Desainer Grafis", date: getDaysBack(10), checkIn: "08:08", checkOut: "17:00", status: "hadir", workHours: 8.87 },
  { id: "r10", userId: "2", userName: "Budi Santoso", department: "Kreatif", position: "Desainer Grafis", date: getDaysBack(11), checkIn: "08:00", checkOut: "17:00", status: "hadir", workHours: 9 },
  // Siti Rahma
  { id: "r11", userId: "3", userName: "Siti Rahma", department: "Event", position: "Event Coordinator", date: getDaysBack(0), checkIn: null, checkOut: null, status: "hadir" },
  { id: "r12", userId: "3", userName: "Siti Rahma", department: "Event", position: "Event Coordinator", date: getDaysBack(1), checkIn: "07:58", checkOut: "17:00", status: "hadir", workHours: 9.03 },
  { id: "r13", userId: "3", userName: "Siti Rahma", department: "Event", position: "Event Coordinator", date: getDaysBack(2), checkIn: "08:00", checkOut: "17:00", status: "hadir", workHours: 9 },
  { id: "r14", userId: "3", userName: "Siti Rahma", department: "Event", position: "Event Coordinator", date: getDaysBack(3), checkIn: "08:05", checkOut: "17:03", status: "hadir", workHours: 8.97 },
  { id: "r15", userId: "3", userName: "Siti Rahma", department: "Event", position: "Event Coordinator", date: getDaysBack(4), checkIn: "09:30", checkOut: "17:00", status: "terlambat", workHours: 7.5 },
  { id: "r16", userId: "3", userName: "Siti Rahma", department: "Event", position: "Event Coordinator", date: getDaysBack(7), checkIn: "08:00", checkOut: "17:00", status: "hadir", workHours: 9 },
  // Extra employees for admin view
  { id: "r17", userId: "4", userName: "Ahmad Fauzi", department: "IT", position: "Web Developer", date: getDaysBack(0), checkIn: "08:10", checkOut: null, status: "hadir" },
  { id: "r18", userId: "4", userName: "Ahmad Fauzi", department: "IT", position: "Web Developer", date: getDaysBack(1), checkIn: "08:00", checkOut: "17:00", status: "hadir", workHours: 9 },
  { id: "r19", userId: "5", userName: "Dewi Kusuma", department: "Marketing", position: "Marketing Specialist", date: getDaysBack(0), checkIn: null, checkOut: null, status: "alpha" },
  { id: "r20", userId: "5", userName: "Dewi Kusuma", department: "Marketing", position: "Marketing Specialist", date: getDaysBack(1), checkIn: "08:15", checkOut: "17:00", status: "terlambat", workHours: 8.75 },
  { id: "r21", userId: "6", userName: "Rizal Pratama", department: "Keuangan", position: "Akuntan", date: getDaysBack(0), checkIn: "08:02", checkOut: null, status: "hadir" },
  { id: "r22", userId: "6", userName: "Rizal Pratama", department: "Keuangan", position: "Akuntan", date: getDaysBack(1), checkIn: "08:00", checkOut: "17:00", status: "hadir", workHours: 9 },
  { id: "r23", userId: "7", userName: "Nurul Hidayah", department: "Kreatif", position: "Fotografer", date: getDaysBack(0), checkIn: null, checkOut: null, status: "izin", notes: "Acara keluarga" },
  { id: "r24", userId: "7", userName: "Nurul Hidayah", department: "Kreatif", position: "Fotografer", date: getDaysBack(1), checkIn: "08:00", checkOut: "17:00", status: "hadir", workHours: 9 },
  { id: "r25", userId: "8", userName: "Hendra Wijaya", department: "Event", position: "Event Staff", date: getDaysBack(0), checkIn: "08:00", checkOut: "17:00", status: "hadir", workHours: 9 },
];

export function AttendanceProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_RECORDS);

  const getTodayRecord = (userId: string) => {
    const todayStr = formatDate(today);
    return records.find((r) => r.userId === userId && r.date === todayStr) || null;
  };

  const getUserRecords = (userId: string) => {
    return records.filter((r) => r.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
  };

  const checkIn = (userId: string, userName: string, department: string, position: string) => {
    const todayStr = formatDate(today);
    const now = new Date();
    const time = formatTime(now);
    const isLate = now.getHours() >= 9;
    
    setRecords((prev) => {
      const existing = prev.find((r) => r.userId === userId && r.date === todayStr);
      if (existing) {
        return prev.map((r) =>
          r.userId === userId && r.date === todayStr
            ? { ...r, checkIn: time, status: isLate ? "terlambat" : "hadir" }
            : r
        );
      }
      return [
        ...prev,
        {
          id: `r${Date.now()}`,
          userId,
          userName,
          department,
          position,
          date: todayStr,
          checkIn: time,
          checkOut: null,
          status: isLate ? "terlambat" : "hadir",
        },
      ];
    });
  };

  const checkOut = (userId: string) => {
    const todayStr = formatDate(today);
    const time = formatTime(new Date());
    setRecords((prev) =>
      prev.map((r) => {
        if (r.userId === userId && r.date === todayStr && r.checkIn) {
          const [inH, inM] = (r.checkIn || "0:0").split(":").map(Number);
          const [outH, outM] = time.split(":").map(Number);
          const workHours = Math.round(((outH * 60 + outM) - (inH * 60 + inM)) / 60 * 100) / 100;
          return { ...r, checkOut: time, workHours };
        }
        return r;
      })
    );
  };

  const addLeave = (userId: string, userName: string, department: string, position: string, type: "izin" | "sakit", notes: string) => {
    const todayStr = formatDate(today);
    setRecords((prev) => {
      const existing = prev.find((r) => r.userId === userId && r.date === todayStr);
      if (existing) {
        return prev.map((r) =>
          r.userId === userId && r.date === todayStr
            ? { ...r, status: type, notes }
            : r
        );
      }
      return [
        ...prev,
        {
          id: `r${Date.now()}`,
          userId,
          userName,
          department,
          position,
          date: todayStr,
          checkIn: null,
          checkOut: null,
          status: type,
          notes,
        },
      ];
    });
  };

  return (
    <AttendanceContext.Provider value={{ records, checkIn, checkOut, getTodayRecord, getUserRecords, addLeave }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext);
  if (!ctx) throw new Error("useAttendance must be used within AttendanceProvider");
  return ctx;
}
