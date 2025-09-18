import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';

const { height } = Dimensions.get('window');

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function TermsModal({ visible, onClose, onAccept }: TermsModalProps) {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      backgroundColor: '#1a1a1a',
      borderRadius: 16,
      margin: 20,
      maxHeight: height * 0.8,
      width: '90%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    closeButton: {
      padding: 4,
    },
    content: {
      padding: 20,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primary[500],
      marginBottom: 8,
    },
    sectionText: {
      fontSize: 14,
      color: '#ffffff',
      lineHeight: 20,
      textAlign: 'justify',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    cancelButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    acceptButton: {
      backgroundColor: colors.primary[500],
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#ffffff',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Termos e Condições de Uso</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.scrollContent}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Aceitação dos Termos</Text>
                <Text style={styles.sectionText}>
                  Ao utilizar este aplicativo ("Aplicativo"), o usuário ("Usuário") concorda integralmente com os presentes Termos e Condições de Uso. Caso não concorde, deve descontinuar imediatamente o uso.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Objeto</Text>
                <Text style={styles.sectionText}>
                  O Aplicativo tem como finalidade fornecer ferramentas de visualização de mercado, integração com APIs externas (incluindo, mas não se limitando à Binance), gráficos em tempo real e funcionalidades voltadas ao acompanhamento de ativos financeiros.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Natureza da Plataforma</Text>
                <Text style={styles.sectionText}>
                  • O Aplicativo não realiza operações financeiras diretas.{'\n'}
                  • O Aplicativo funciona como plataforma informativa e painel de visualização de dados de mercado.{'\n'}
                  • Qualquer decisão de investimento tomada pelo Usuário é de sua exclusiva responsabilidade.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Uso de APIs de Terceiros</Text>
                <Text style={styles.sectionText}>
                  • O Aplicativo se conecta a serviços externos, incluindo a API pública da Binance, para coleta de dados em tempo real.{'\n'}
                  • A disponibilidade e estabilidade das informações dependem exclusivamente dos provedores externos.{'\n'}
                  • O Aplicativo não se responsabiliza por interrupções, atrasos ou inconsistências nesses dados.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>5. Responsabilidades do Usuário</Text>
                <Text style={styles.sectionText}>
                  • O Usuário compromete-se a utilizar o Aplicativo de forma legal e ética.{'\n'}
                  • O Usuário é o único responsável por analisar, validar e agir sobre os dados obtidos no Aplicativo.{'\n'}
                  • O Aplicativo não garante lucros, rentabilidade ou resultados de investimento.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>6. Limitação de Responsabilidade</Text>
                <Text style={styles.sectionText}>
                  • O Aplicativo não se responsabiliza por perdas financeiras, danos indiretos ou decisões de investimento tomadas a partir de dados exibidos.{'\n'}
                  • A utilização do Aplicativo é por conta e risco exclusivo do Usuário.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>7. Propriedade Intelectual</Text>
                <Text style={styles.sectionText}>
                  Todo o design, código-fonte, gráficos e conteúdos produzidos pelo Aplicativo são de propriedade exclusiva de seus desenvolvedores, não podendo ser reproduzidos sem autorização.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>8. Alterações nos Termos</Text>
                <Text style={styles.sectionText}>
                  O Aplicativo poderá atualizar estes Termos a qualquer momento. O uso contínuo após mudanças implica na aceitação das novas condições.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>9. Legislação Aplicável</Text>
                <Text style={styles.sectionText}>
                  Estes Termos serão regidos e interpretados de acordo com as leis brasileiras.
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.acceptButton]} onPress={onAccept}>
              <Text style={styles.buttonText}>Aceitar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
