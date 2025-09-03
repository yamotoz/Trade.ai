import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '@/lib/theme';

const { width: screenWidth } = Dimensions.get('window');

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface VolumeData {
  timestamp: number;
  volume: number;
}

interface HighchartsChartProps {
  symbol: string;
  title: string;
  height?: number;
  data?: CandleData[];
  volumeData?: VolumeData[];
  interval?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  onChartReady?: () => void;
}

export function HighchartsChart({
  symbol,
  title,
  height = 300,
  data,
  volumeData,
  interval = '1d',
  onChartReady
}: HighchartsChartProps) {
  const { colors } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);

  // Função para converter dados para o formato do Highcharts
  const formatDataForHighcharts = (candleData: CandleData[], volData: VolumeData[]) => {
    const formattedCandles = candleData.map(candle => [
      candle.timestamp,
      candle.open,
      candle.high,
      candle.low,
      candle.close
    ]);

    const formattedVolume = volData.map(vol => [
      vol.timestamp,
      vol.volume
    ]);

    return { candles: formattedCandles, volume: formattedVolume };
  };

  // Função para enviar dados para o WebView
  const updateChartData = () => {
    if (webViewRef.current && chartReady) {
      const message = {
        type: 'updateChart',
        symbol,
        title,
        data: data ? formatDataForHighcharts(data, volumeData || []).candles : null,
        volumeData: volumeData ? formatDataForHighcharts(data || [], volumeData).volume : null,
        interval
      };

      webViewRef.current.postMessage(JSON.stringify(message));
    }
  };

  // Atualizar dados quando props mudarem
  useEffect(() => {
    if (chartReady) {
      updateChartData();
    }
  }, [symbol, title, data, volumeData, interval, chartReady]);

  // Função para lidar com mensagens do WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'chartReady') {
        setChartReady(true);
        setIsLoading(false);
        onChartReady?.();
        updateChartData();
      }
    } catch (error) {
      console.log('Erro ao processar mensagem do WebView:', error);
    }
  };

  // Função para injetar JavaScript no WebView
  const injectedJavaScript = `
    (function() {
      // Notificar que o gráfico está pronto
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'chartReady'
      }));
    })();
    true;
  `;

  // HTML template inline (para evitar problemas de carregamento)
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Trade.ai - Gráfico de Preços</title>
        <script src="https://code.highcharts.com/stock/highstock.js"></script>
        <script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
        <script src="https://code.highcharts.com/stock/modules/accessibility.js"></script>
        <style>
            body {
                margin: 0;
                padding: 0;
                background-color: #0a0a0a;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                overflow: hidden;
            }
            #container {
                width: 100%;
                height: 100vh;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
            }
            .loading {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                color: #4a9eff;
                font-size: 16px;
                font-weight: 600;
            }
            .loading::after {
                content: '';
                width: 20px;
                height: 20px;
                border: 2px solid #4a9eff;
                border-top: 2px solid transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-left: 10px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body>
        <div id="container">
            <div class="loading">Carregando gráfico...</div>
        </div>

        <script>
            // Função para gerar dados mockados de candlestick
            function generateMockData(symbol, days = 30) {
                const data = [];
                const volume = [];
                let basePrice = 100;
                
                // Preços base por símbolo
                const basePrices = {
                    'BTC': 45000,
                    'PETR4': 32.50,
                    'VALE3': 68.75,
                    'ITUB4': 28.90,
                    'BBDC4': 22.15,
                    'ABEV3': 12.80,
                    'WEGE3': 45.20,
                    'RENT3': 18.75,
                    'LREN3': 15.30
                };
                
                basePrice = basePrices[symbol] || 100;
                
                for (let i = days; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    
                    // Simular variação de preço
                    const variation = (Math.random() - 0.5) * 0.1; // ±5% de variação
                    const open = basePrice * (1 + variation);
                    const close = open * (1 + (Math.random() - 0.5) * 0.08); // ±4% de variação do fechamento
                    const high = Math.max(open, close) * (1 + Math.random() * 0.03); // Máximo 3% acima
                    const low = Math.min(open, close) * (1 - Math.random() * 0.03); // Máximo 3% abaixo
                    
                    // Volume simulado
                    const vol = Math.floor(Math.random() * 1000000) + 100000;
                    
                    data.push([
                        date.getTime(),
                        Math.round(open * 100) / 100,
                        Math.round(high * 100) / 100,
                        Math.round(low * 100) / 100,
                        Math.round(close * 100) / 100
                    ]);
                    
                    volume.push([
                        date.getTime(),
                        vol
                    ]);
                    
                    basePrice = close; // Próximo preço baseado no fechamento anterior
                }
                
                return { data, volume };
            }

            // Função para criar o gráfico
            function createChart(symbol, title, candleData, volumeData) {
                const mockData = generateMockData(symbol);
                const chartData = candleData || mockData.data;
                const chartVolume = volumeData || mockData.volume;
                
                Highcharts.stockChart('container', {
                    chart: {
                        backgroundColor: 'transparent',
                        style: {
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                    },
                    
                    title: {
                        text: symbol + ' - ' + title,
                        style: {
                            color: '#ffffff',
                            fontSize: '16px',
                            fontWeight: '600'
                        },
                        align: 'left',
                        margin: 15
                    },
                    
                    subtitle: {
                        text: 'Dados em tempo real',
                        style: {
                            color: '#4a9eff',
                            fontSize: '11px'
                        },
                        align: 'left'
                    },
                    
                    rangeSelector: {
                        enabled: false
                    },
                    
                    navigator: {
                        enabled: false
                    },
                    
                    scrollbar: {
                        enabled: false
                    },
                    
                    xAxis: {
                        type: 'datetime',
                        labels: {
                            style: {
                                color: '#888888',
                                fontSize: '10px'
                            }
                        },
                        lineColor: '#333333',
                        tickColor: '#333333'
                    },
                    
                    yAxis: [{
                        title: {
                            text: 'Preço',
                            style: {
                                color: '#ffffff',
                                fontSize: '11px'
                            }
                        },
                        labels: {
                            style: {
                                color: '#888888',
                                fontSize: '10px'
                            },
                            formatter: function() {
                                return 'R$ ' + this.value.toFixed(2);
                            }
                        },
                        gridLineColor: '#222222',
                        lineColor: '#333333'
                    }, {
                        title: {
                            text: 'Volume',
                            style: {
                                color: '#ffffff',
                                fontSize: '11px'
                            }
                        },
                        labels: {
                            style: {
                                color: '#888888',
                                fontSize: '10px'
                            }
                        },
                        gridLineColor: '#222222',
                        lineColor: '#333333',
                        top: '75%',
                        height: '25%',
                        offset: 0
                    }],
                    
                    plotOptions: {
                        candlestick: {
                            color: '#ff4757',
                            upColor: '#2ed573',
                            lineColor: '#ff4757',
                            upLineColor: '#2ed573',
                            dataLabels: {
                                enabled: false
                            }
                        },
                        column: {
                            color: '#4a9eff',
                            borderColor: 'transparent'
                        }
                    },
                    
                    series: [{
                        type: 'candlestick',
                        name: symbol,
                        data: chartData,
                        color: '#ff4757',
                        upColor: '#2ed573',
                        lineColor: '#ff4757',
                        upLineColor: '#2ed573',
                        tooltip: {
                            pointFormatter: function() {
                                return '<span style="color:' + this.color + '">●</span> ' + this.series.name + ': ' +
                                    '<b>Abertura:</b> R$ ' + this.open.toFixed(2) + '<br/>' +
                                    '<b>Máxima:</b> R$ ' + this.high.toFixed(2) + '<br/>' +
                                    '<b>Mínima:</b> R$ ' + this.low.toFixed(2) + '<br/>' +
                                    '<b>Fechamento:</b> R$ ' + this.close.toFixed(2);
                            }
                        }
                    }, {
                        type: 'column',
                        name: 'Volume',
                        data: chartVolume,
                        yAxis: 1,
                        color: '#4a9eff',
                        tooltip: {
                            pointFormatter: function() {
                                return '<span style="color:' + this.color + '">●</span> Volume: <b>' + this.y.toLocaleString() + '</b>';
                            }
                        }
                    }],
                    
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        borderColor: '#4a9eff',
                        borderRadius: 8,
                        style: {
                            color: '#ffffff',
                            fontSize: '11px'
                        },
                        shared: true,
                        split: false
                    },
                    
                    legend: {
                        enabled: false
                    },
                    
                    credits: {
                        enabled: false
                    },
                    
                    exporting: {
                        enabled: false
                    }
                });
            }

            // Função para receber dados do React Native
            function updateChart(symbol, title, candleData, volumeData) {
                createChart(symbol, title, candleData, volumeData);
            }

            // Escutar mensagens do React Native
            document.addEventListener('message', function(event) {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'updateChart') {
                        updateChart(message.symbol, message.title, message.data, message.volumeData);
                    }
                } catch (e) {
                    console.log('Erro ao processar mensagem:', e);
                }
            });

            // Inicializar com dados padrão
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(() => {
                    createChart('BTC', 'Bitcoin', null, null);
                }, 100);
            });
        </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, { height, backgroundColor: colors.surface.primary }]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a9eff" />
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webView}
        onMessage={handleWebViewMessage}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={false}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('WebView error: ', nativeEvent);
          setIsLoading(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333333',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    zIndex: 1,
  },
});
