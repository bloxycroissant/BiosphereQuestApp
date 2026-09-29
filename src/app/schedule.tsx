import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import { useProgress, type StudySession } from "@/hooks/use-progress";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function ScheduleScreen() {
  const { sessions, addSession, updateSession, addXp } = useProgress();
  const [day, setDay] = useState("Monday");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [duration, setDuration] = useState("30");
  const [editingId, setEditingId] = useState<StudySession["id"] | null>(null);
  const addNewSession = () => {
    if (!title.trim()) return;
    addSession({
      day,
      title: title.trim(),
      time: `${time}${period} · ${duration} mins`,
    });
    setTitle("");
  };
  const toggleDone = (session: StudySession) => {
    if (!session.done) addXp(20);
    updateSession(session.id, { done: !session.done });
  };
  const editSession = (session: StudySession) => {
    setEditingId(session.id);
    setTitle(session.title);
  };
  const saveEdit = (session: StudySession) => {
    updateSession(session.id, { title: title.trim() || session.title });
    setEditingId(null);
    setTitle("");
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.back}>‹ Cancel</Text>
        <Text style={styles.title}>Study Schedule</Text>
        <Text style={styles.subtitle}>
          Plan sessions, build your streak, and keep moving.
        </Text>
        <Text style={styles.section}>Add a session</Text>
        <View style={styles.dayRow}>
          {days.map((item) => (
            <Pressable
              key={item}
              onPress={() => setDay(item)}
              style={[styles.day, day === item && styles.daySelected]}
            >
              <Text style={styles.dayText}>{item.slice(0, 3)}</Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="Session title"
          placeholderTextColor="#aebee0"
        />
        <View style={styles.timeRow}>
          <TextInput
            value={time}
            onChangeText={setTime}
            style={[styles.input, styles.timeInput]}
            placeholder="09:00"
            placeholderTextColor="#aebee0"
          />
          <Pressable
            onPress={() => setPeriod("AM")}
            style={[styles.period, period === "AM" && styles.periodSelected]}
          >
            <Text style={styles.periodText}>AM</Text>
          </Pressable>
          <Pressable
            onPress={() => setPeriod("PM")}
            style={[styles.period, period === "PM" && styles.periodSelected]}
          >
            <Text style={styles.periodText}>PM</Text>
          </Pressable>
          <TextInput
            value={duration}
            onChangeText={setDuration}
            style={[styles.input, styles.durationInput]}
            keyboardType="number-pad"
            placeholder="30"
            placeholderTextColor="#aebee0"
          />
        </View>
        <Pressable onPress={addNewSession} style={styles.addButton}>
          <Text style={styles.addText}>+ Add session</Text>
        </Pressable>
        <Text style={styles.section}>This week</Text>
        {sessions.map((session) => (
          <View
            key={session.id}
            style={[styles.session, session.done && styles.sessionDone]}
          >
            <Pressable
              onPress={() => toggleDone(session)}
              style={[styles.check, session.done && styles.checkDone]}
            >
              <Text style={styles.checkText}>{session.done ? "✓" : ""}</Text>
            </Pressable>
            <View style={styles.sessionDetails}>
              {editingId === session.id ? (
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  style={styles.editInput}
                  autoFocus
                />
              ) : (
                <Text style={styles.sessionTitle}>{session.title}</Text>
              )}
              <Text style={styles.sessionMeta}>
                {session.day} · {session.time}
              </Text>
            </View>
            <Pressable
              onPress={() =>
                editingId === session.id
                  ? saveEdit(session)
                  : editSession(session)
              }
              style={styles.editButton}
            >
              <Text style={styles.editText}>
                {editingId === session.id ? "Save" : "Edit"}
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#091426" },
  content: { padding: 18, paddingBottom: 40 },
  back: { color: "#e582ff", fontWeight: "800" },
  title: { color: "#fff", fontSize: 27, fontWeight: "900", marginTop: 14 },
  subtitle: { color: "#c7d0e8", marginTop: 4 },
  section: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 24,
    marginBottom: 10,
  },
  dayRow: { flexDirection: "row", gap: 5, flexWrap: "wrap" },
  day: {
    backgroundColor: "#252a69",
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  daySelected: { backgroundColor: "#6258ff" },
  dayText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  input: {
    backgroundColor: "#283b78",
    borderColor: "#5d65e4",
    borderWidth: 1,
    borderRadius: 10,
    color: "#fff",
    padding: 12,
    marginTop: 10,
  },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  timeInput: { flex: 1 },
  period: {
    backgroundColor: "#252a69",
    borderRadius: 9,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  periodSelected: { backgroundColor: "#6258ff" },
  periodText: { color: "#fff", fontWeight: "900" },
  durationInput: { width: 62 },
  addButton: {
    backgroundColor: "#168c68",
    borderRadius: 11,
    alignItems: "center",
    padding: 13,
    marginTop: 12,
  },
  addText: { color: "#fff", fontWeight: "900" },
  session: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#253d78",
    borderColor: "#5665dc",
    borderWidth: 1,
    borderRadius: 13,
    padding: 10,
    marginTop: 9,
  },
  sessionDone: { backgroundColor: "#205d51", borderColor: "#46d483" },
  check: {
    width: 31,
    height: 31,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "#52abdf",
    alignItems: "center",
    justifyContent: "center",
  },
  checkDone: { backgroundColor: "#24ad68", borderColor: "#8ff0ae" },
  checkText: { color: "#fff", fontSize: 19, fontWeight: "900" },
  sessionDetails: { flex: 1, marginLeft: 10 },
  sessionTitle: { color: "#fff", fontWeight: "900", fontSize: 13 },
  sessionMeta: { color: "#c6d4ee", fontSize: 10, marginTop: 4 },
  editButton: { paddingHorizontal: 8, paddingVertical: 6 },
  editText: { color: "#f3d052", fontWeight: "900" },
  editInput: {
    backgroundColor: "#172849",
    color: "#fff",
    borderBottomColor: "#f3d052",
    borderBottomWidth: 1,
    paddingVertical: 3,
  },
});
