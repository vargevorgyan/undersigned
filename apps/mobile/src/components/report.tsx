import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { timeAgo } from '@/lib/format';
import {
  FACT_KEYS,
  FACT_LABELS,
  USER_FRIENDLY_YES,
  type Highlight,
  type Impact,
  type PolicyAnalysis,
  type RuleResult,
  type RuleStatus,
  type ServiceView,
  type Severity,
  type TriState,
  type Verdict,
} from '@/lib/types';
import { radius, space, useTheme, type Palette } from '@/theme';
import { Icon, type IconName } from './icon';
import { Body, Caption, Card, Divider, Muted, Row, Subheading } from './ui';

// ---------- Rules / verdict ----------

const STATUS_ICON: Record<RuleStatus, IconName> = { pass: 'check', fail: 'fail', unclear: 'unclear' };

function statusColor(c: Palette, s: RuleStatus) {
  if (s === 'pass') return c.success;
  if (s === 'fail') return c.danger;
  return c.warn;
}

function verdictCopy(v: Verdict) {
  const total = v.results.length;
  if (v.status === 'violation') return `Breaks ${v.failed} of your ${total} rules`;
  if (v.status === 'warning') return `${v.unclear} of your rules ${v.unclear === 1 ? "isn't" : "aren't"} clearly covered`;
  if (v.status === 'ok') return 'Meets all your rules';
  return 'Pick rules to get a personal verdict';
}

function verdictTone(c: Palette, v: Verdict) {
  if (v.status === 'violation') return { fg: c.danger, bg: c.dangerSoft, icon: 'warning' as const };
  if (v.status === 'warning') return { fg: c.warn, bg: c.warnSoft, icon: 'unclear' as const };
  if (v.status === 'ok') return { fg: c.success, bg: c.successSoft, icon: 'shield' as const };
  return { fg: c.accent, bg: c.accentSoft, icon: 'sliders' as const };
}

function Quote({ text }: { text: string }) {
  const { c } = useTheme();
  if (!text) return null;
  return (
    <View style={[styles.quote, { borderLeftColor: c.border }]}>
      <Text style={{ color: c.muted, fontSize: 14, lineHeight: 20, fontStyle: 'italic' }}>“{text}”</Text>
    </View>
  );
}

function RuleRow({ result }: { result: RuleResult }) {
  const { c } = useTheme();
  const [open, setOpen] = useState(false);
  const color = statusColor(c, result.status);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={`${result.label}: ${result.status}`}
      onPress={() => {
        Haptics.selectionAsync();
        setOpen((o) => !o);
      }}
      style={{ paddingVertical: space.md, gap: space.sm, minHeight: 44 }}>
      <Row>
        <Icon name={STATUS_ICON[result.status]} size={22} color={color} />
        <Body style={{ flex: 1, fontWeight: '500' }}>{result.label}</Body>
        <Icon name="chevronDown" size={14} color={c.faint} />
      </Row>
      {open && (
        <View style={{ paddingLeft: 34, gap: space.sm }}>
          <Muted>{result.reason}</Muted>
          <Quote text={result.quote} />
        </View>
      )}
    </Pressable>
  );
}

export function VerdictCard({ verdict, onEditRules }: { verdict: Verdict; onEditRules: () => void }) {
  const { c } = useTheme();
  const tone = verdictTone(c, verdict);
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <Pressable onPress={onEditRules} accessibilityRole="button" accessibilityHint="Edit your rules" style={[styles.verdictHeader, { backgroundColor: tone.bg }]}>
        <Icon name={tone.icon} size={22} color={tone.fg} />
        <Text style={{ flex: 1, color: tone.fg, fontSize: 17, fontWeight: '700' }}>{verdictCopy(verdict)}</Text>
        <Text style={{ color: tone.fg, fontSize: 14, fontWeight: '600' }}>Edit</Text>
      </Pressable>
      {verdict.results.length > 0 && (
        <View style={{ paddingHorizontal: space.lg }}>
          {verdict.results.map((r, i) => (
            <View key={r.ruleId}>
              {i > 0 && <Divider />}
              <RuleRow result={r} />
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

// ---------- Highlights ----------

const SEVERITY_ORDER: Severity[] = ['bad', 'caution', 'neutral', 'good'];
const SEVERITY_TITLE: Record<Severity, string> = { bad: 'Watch out', caution: 'Be aware', neutral: 'Good to know', good: 'The good parts' };

function severityColor(c: Palette, s: Severity) {
  if (s === 'bad') return c.danger;
  if (s === 'caution') return c.warn;
  if (s === 'good') return c.success;
  return c.muted;
}

function HighlightRow({ h }: { h: Highlight }) {
  const { c } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      onPress={() => h.quote && setOpen((o) => !o)}
      style={{ paddingVertical: space.md, gap: 6, minHeight: 44 }}>
      <Row style={{ alignItems: 'flex-start' }}>
        <View style={[styles.dot, { backgroundColor: severityColor(c, h.severity) }]} />
        <View style={{ flex: 1, gap: 4 }}>
          <Subheading>{h.title}</Subheading>
          <Muted>{h.explanation}</Muted>
          {h.quote !== '' && !open && <Caption style={{ color: c.accent, fontWeight: '600' }}>Show the exact wording</Caption>}
          {open && <Quote text={h.quote} />}
        </View>
      </Row>
    </Pressable>
  );
}

export function Highlights({ items }: { items: Highlight[] }) {
  const groups = SEVERITY_ORDER.map((s) => ({ s, list: items.filter((h) => h.severity === s) })).filter((g) => g.list.length);
  return (
    <View style={{ gap: space.md }}>
      {groups.map(({ s, list }) => (
        <Card key={s} style={{ paddingVertical: space.sm }}>
          <SeverityTitle severity={s} count={list.length} />
          {list.map((h, i) => (
            <View key={i}>
              {i > 0 && <Divider />}
              <HighlightRow h={h} />
            </View>
          ))}
        </Card>
      ))}
    </View>
  );
}

function SeverityTitle({ severity, count }: { severity: Severity; count: number }) {
  const { c } = useTheme();
  return (
    <Text style={{ color: severityColor(c, severity), fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, paddingTop: space.sm }}>
      {SEVERITY_TITLE[severity]} · {count}
    </Text>
  );
}

// ---------- Facts ----------

function factTone(c: Palette, key: (typeof FACT_KEYS)[number], value: TriState) {
  if (value === 'unclear') return { color: c.faint, label: 'Not stated' };
  const good = USER_FRIENDLY_YES.includes(key) ? value === 'yes' : value === 'no';
  return { color: good ? c.success : c.danger, label: value === 'yes' ? 'Yes' : 'No' };
}

export function FactList({ analysis }: { analysis: PolicyAnalysis }) {
  const { c } = useTheme();
  return (
    <Card style={{ paddingVertical: space.xs }}>
      {FACT_KEYS.map((k, i) => {
        const fact = analysis.facts[k];
        const tone = factTone(c, k, fact.value);
        return (
          <View key={k}>
            {i > 0 && <Divider />}
            <Row style={{ paddingVertical: 12, minHeight: 44 }}>
              <Body style={{ flex: 1, fontSize: 15 }}>{FACT_LABELS[k]}</Body>
              <Text style={{ color: tone.color, fontWeight: '700', fontSize: 14 }}>{tone.label}</Text>
            </Row>
          </View>
        );
      })}
      <Divider />
      <View style={{ paddingVertical: 12, gap: 6 }}>
        <Caption>Data kept for</Caption>
        <Body style={{ fontSize: 15 }}>{analysis.dataRetention}</Body>
        <Caption style={{ marginTop: 6 }}>Governing law</Caption>
        <Body style={{ fontSize: 15 }}>{analysis.jurisdiction}</Body>
      </View>
    </Card>
  );
}

// ---------- Segmented control ----------

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const { c } = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: c.cardPressed }]} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              Haptics.selectionAsync();
              onChange(o.value);
            }}
            style={[styles.segment, active && { backgroundColor: c.card, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } }]}>
            <Text style={{ color: active ? c.ink : c.muted, fontWeight: active ? '700' : '500', fontSize: 14 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------- History ----------

export function impactColor(c: Palette, impact: Impact) {
  if (impact === 'worse') return c.danger;
  if (impact === 'better') return c.success;
  return c.muted;
}

export function History({ items }: { items: ServiceView['history'] }) {
  const { c } = useTheme();
  if (items.length === 0) {
    return (
      <Card>
        <Muted>No changes recorded yet. Watch this service and we'll tell you the moment its policies change.</Muted>
      </Card>
    );
  }
  return (
    <Card style={{ gap: space.lg }}>
      {items.map((h, i) => (
        <Row key={h.id} style={{ alignItems: 'flex-start' }}>
          <View style={{ alignItems: 'center', width: 14 }}>
            <View style={[styles.timelineDot, { backgroundColor: impactColor(c, h.change.impact) }]} />
            {i < items.length - 1 && <View style={[styles.timelineLine, { backgroundColor: c.border }]} />}
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Caption>{timeAgo(h.fetchedAt)}</Caption>
            <Subheading>{h.change.headline}</Subheading>
            {h.change.points.map((p, j) => (
              <Muted key={j}>• {p}</Muted>
            ))}
          </View>
        </Row>
      ))}
    </Card>
  );
}

// ---------- Analysis progress ----------

export function StepList({ steps, active, done }: { steps: string[]; active: number; done: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: space.lg }}>
      {steps.map((label, i) => {
        const complete = done || i < active;
        const current = !done && i === active;
        let color = c.faint;
        if (complete) color = c.success;
        else if (current) color = c.accent;
        return (
          <Row key={label} style={{ opacity: complete || current ? 1 : 0.5 }}>
            <View style={[styles.step, { borderColor: color, backgroundColor: complete ? color : 'transparent' }]}>
              {complete && <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>✓</Text>}
              {current && <View style={[styles.stepPulse, { backgroundColor: color }]} />}
            </View>
            <Text style={{ color: current ? c.ink : c.muted, fontSize: 17, fontWeight: current ? '700' : '500' }}>{label}</Text>
          </Row>
        );
      })}
    </View>
  );
}

export function SummaryCard({ analysis }: { analysis: PolicyAnalysis }) {
  const { c } = useTheme();
  return (
    <Card style={{ gap: space.sm, backgroundColor: c.accentSoft, borderColor: 'transparent' }}>
      <Row style={{ gap: space.sm }}>
        <Icon name="sparkles" size={16} color={c.accent} />
        <Text style={{ color: c.accent, fontWeight: '700', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.6 }}>In plain words</Text>
      </Row>
      <Body>{analysis.summary}</Body>
    </Card>
  );
}

const styles = StyleSheet.create({
  quote: { borderLeftWidth: 3, paddingLeft: space.md, paddingVertical: 2 },
  verdictHeader: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, minHeight: 56 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  segmented: { flexDirection: 'row', borderRadius: radius.md, padding: 3 },
  segment: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  timelineLine: { width: 2, flex: 1, marginTop: 4, minHeight: 24 },
  step: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepPulse: { width: 10, height: 10, borderRadius: 5 },
});
