import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { Colors } from "react-native/Libraries/NewAppScreen";

// Componente principal
export default function Introduction() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="trending-up" size={28} color="#fff" />
        <Text style={styles.title}>📈 Guia de Estudo para Day Traders</Text>
      </View>
      <Text style={styles.subtitle}>
        Do básico ao avançado, com foco em disciplina, gestão de risco e consistência.
      </Text>

      {/* Introdução */}
      <Section title="Introdução">
        <Text style={styles.paragraph}>
          O mercado financeiro oferece grandes oportunidades, mas também riscos
          significativos. Ser um <Text style={styles.bold}>day trader</Text> exige
          disciplina, gestão de risco, inteligência emocional e, sobretudo,
          conhecimento estruturado.
        </Text>
        <Text style={styles.paragraph}>
          Este guia foi construído para que você possa{" "}
          <Text style={styles.bold}>progredir de forma clara e eficiente</Text>,
          passando do básico ao avançado, desenvolvendo uma visão estratégica e
          prática consistente.
        </Text>
      </Section>

         <Stage
        stage="Etapa 1"
        title="Básico (Fundamentos do Day Trade)"
        objective="Construir base sólida, entendendo conceitos essenciais e ferramentas do mercado."
      >
        <SubGroup title="Conceitos Iniciais" items={[
          "O que é Day Trade e como funciona",
          "Diferença entre Day Trade, Swing Trade e Investimento",
          "Glossário básico: stop loss, stop gain, alavancagem, margem, liquidez"
        ]} />
        <SubGroup title="Mercado e Ativos" items={[
          "Ações, minicontratos (índice e dólar), forex, criptomoedas",
          "Horários de negociação e características de cada mercado"
        ]} />
        <SubGroup title="Plataformas e Ferramentas" items={[
          "Plataformas de negociação (ex: MetaTrader, Profit, Thinkorswim)",
          "Gráficos de candles, volume, tempo gráfico (1min, 5min, 15min)"
        ]} />
        <SubGroup title="Noções de Análise Técnica" items={[
          "Suporte e resistência",
          "Tendência de alta, baixa e lateralidade",
          "Candlesticks básicos (martelo, doji, engolfo)"
        ]} />
        <SubGroup title="Gestão de Risco Inicial" items={[
          "Tamanho da posição",
          "Importância do stop loss",
          "Risco x retorno"
        ]} />
      </Stage>

      {/* Etapa 2 */}
      <Stage
        stage="Etapa 2"
        title="Intermediário (Estratégias e Psicologia)"
        objective="Aprimorar habilidades práticas, desenvolver estratégias e dominar a mentalidade necessária."
      >
        <SubGroup title="Análise Técnica Intermediária" items={[
          "Médias móveis (curtas e longas)",
          "Bandas de Bollinger, RSI, MACD",
          "Volume e fluxo de ordens"
        ]} />
        <SubGroup title="Estratégias de Entrada e Saída" items={[
          "Pullbacks",
          "Rompimentos (breakouts)",
          "Operações de reversão e continuidade de tendência"
        ]} />
        <SubGroup title="Gestão de Capital" items={[
          "Definição de risco diário e semanal",
          "Controle de perdas sequenciais",
          "Diversificação e foco em poucos ativos"
        ]} />
        <SubGroup title="Psicologia do Trader" items={[
          "Controle emocional diante de perdas",
          "Evitar overtrading (operar em excesso)",
          "Criar e seguir um plano de trading"
        ]} />
        <SubGroup title="Registro e Avaliação" items={[
          "Manter um diário de trades (trade journal)",
          "Avaliar métricas de performance: win rate, payoff ratio, drawdown"
        ]} />
      </Stage>

      {/* Etapa 3 */}
      <Stage
        stage="Etapa 3"
        title="Avançado (Performance e Profissionalização)"
        objective="Tornar-se consistente, aplicando técnicas avançadas e profissionalizando a atuação."
      >
        <SubGroup title="Análise Técnica Avançada" items={[
          "Leitura de fluxo (Tape Reading e Times & Trades)",
          "Order book (Livro de Ofertas)",
          "Estratégias com múltiplos indicadores"
        ]} />
        <SubGroup title="Gestão de Risco Avançada" items={[
          "Piramidação e redução de posição",
          "Hedge e operações simultâneas em diferentes ativos",
          "Estatísticas avançadas de risco/retorno"
        ]} />
        <SubGroup title="Estratégias Avançadas" items={[
          "Scalping (operações de curtíssimo prazo)",
          "Operações com alta alavancagem (gestão eficiente)",
          "Estratégias quantitativas e backtests"
        ]} />
        <SubGroup title="Rotina Profissional" items={[
          "Preparação pré-mercado (plano diário)",
          "Disciplina para seguir o setup",
          "Revisão pós-mercado"
        ]} />
        <SubGroup title="Mentalidade de Trader Profissional" items={[
          "Consistência acima de ganhos rápidos",
          "Adaptabilidade em diferentes cenários de mercado",
          "Criação de setups autorais e edge próprio"
        ]} />
      </Stage>

      {/* Conclusão */}
      <Section title="📌 Conclusão">
        <Text style={styles.paragraph}>
          Ser um day trader não é sobre procurar atalhos, mas sobre seguir um
          caminho estruturado de aprendizado. Do básico ao avançado, você
          construirá não apenas conhecimento técnico, mas também a mentalidade
          necessária para operar com confiança e disciplina.
        </Text>
        <Text style={styles.paragraph}>
          Com dedicação, prática e controle, você estará preparado para buscar
          consistência no mercado e transformar o day trade em uma atividade
          sólida e profissional.
        </Text>
      </Section>

      {/* Vídeo dentro do app */}
      <View style={{ marginTop: 24, height: 220, borderRadius: 12, overflow: "hidden" }}>
        <WebView
          source={{ uri: "https://www.youtube.com/embed/VhnNSZHGYFE" }}
          style={{ flex: 1 }}
          allowsFullscreenVideo
        />
      </View>
    </ScrollView>
  );
}

/* ------------------- COMPONENTES AUXILIARES ------------------- */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Stage({ stage, title, objective, children }: { stage: string; title: string; objective: string; children: React.ReactNode }) {
  return (
    <View style={styles.stage}>
      <Text style={styles.stageTitle}>{stage} – {title}</Text>
      <Text style={styles.stageObjective}>{objective}</Text>
      {children}
    </View>
  );
}

function SubGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={styles.subGroup}>
      <Text style={styles.subGroupTitle}>{title}</Text>
      {items.map((item, i) => (
        <Text key={i} style={styles.listItem}>• {item}</Text>
      ))}
    </View>
  );
}

/* ------------------- ESTILOS ------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff", flex: 1, lineHeight: 28 },
  subtitle: { fontSize: 16, color: "#fff", marginBottom: 24, lineHeight: 22 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12, color: "#fff" },
  paragraph: { fontSize: 15, lineHeight: 24, color: "#fff", marginBottom: 12 },
  bold: { fontWeight: "bold" },
  stage: { marginBottom: 28 },
  stageTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6, color: "#fff" },
  stageObjective: { fontSize: 14, color: "#ccc", marginBottom: 14, lineHeight: 20 },
  subGroup: { marginBottom: 16 },
  subGroupTitle: { fontSize: 15, fontWeight: "600", marginBottom: 8, color: "#fff" },
  listItem: { fontSize: 14, color: "#fff", marginLeft: 10, marginBottom: 6, lineHeight: 20 },
});
