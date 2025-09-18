import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '@/lib/theme';

const { width: screenWidth } = Dimensions.get('window');

interface PortfolioData {
  timestamp: number;
  value: number;
}

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface PortfolioChartProps {
  type: 'line' | 'bar' | 'donut';
  data?: PortfolioData[];
  categoryData?: CategoryData[];
  totalValue?: number;
  height?: number;
  onChartReady?: () => void;
}

export function PortfolioChart({
  type,
  data,
  categoryData,
  totalValue = 0,
  height = 250,
  onChartReady
}: PortfolioChartProps) {
  const { colors } = useTheme();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);

  // Função para gerar dados mockados de evolução do portfolio
  const generatePortfolioEvolutionData = (): PortfolioData[] => {
    const data: PortfolioData[] = [];
    const startValue = totalValue * 0.8; // Começar com 80% do valor atual
    let currentValue = startValue;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simular crescimento gradual com volatilidade
      const dailyReturn = (Math.random() - 0.3) * 0.05; // Ligeiramente positivo
      currentValue = currentValue * (1 + dailyReturn);
      
      data.push({
        timestamp: date.getTime(),
        value: Math.round(currentValue * 100) / 100
      });
    }
    
    return data;
  };

  // Função para enviar dados para o WebView
  const updateChartData = () => {
    if (webViewRef.current && chartReady) {
      const chartData = type === 'line' ? (data || generatePortfolioEvolutionData()) : categoryData || [];
      
      console.log('Sending chart data:', {
        type,
        chartData,
        totalValue,
        categoryData
      });
      
      const message = {
        type: 'updatePortfolioChart',
        chartType: type,
        data: chartData,
        totalValue,
        colors: {
          primary: colors.primary[500],
          success: '#2ed573',
          danger: '#ff4757',
          warning: '#ffa500',
          info: '#4a9eff'
        }
      };

      webViewRef.current.postMessage(JSON.stringify(message));
    }
  };

  // Atualizar dados quando props mudarem
  useEffect(() => {
    if (chartReady) {
      updateChartData();
    }
  }, [type, data, categoryData, totalValue, chartReady]);

  // Função para lidar com mensagens do WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('WebView message received:', message);
      
      if (message.type === 'chartReady') {
        console.log('Chart is ready, updating data...');
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
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'chartReady'
      }));
    })();
    true;
  `;

  // HTML template com gráficos específicos para portfolio
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Trade.ai - Portfolio Charts</title>
        <script src="https://code.highcharts.com/highcharts.js"></script>
        <script src="https://code.highcharts.com/modules/exporting.js"></script>
        <script src="https://code.highcharts.com/modules/accessibility.js"></script>
        <style>
            body {
                margin: 0;
                padding: 0;
                background-color: transparent;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                overflow: hidden;
            }
            #container {
                width: 100%;
                height: 100vh;
                background: transparent;
            }
            .loading {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                color: #4a9eff;
                font-size: 14px;
                font-weight: 600;
            }
            .loading::after {
                content: '';
                width: 16px;
                height: 16px;
                border: 2px solid #4a9eff;
                border-top: 2px solid transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-left: 8px;
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
            let currentChart = null;
            let currentColors = {};

            // Função para criar gráfico de linha (evolução do portfolio)
            function createLineChart(data, totalValue, colors) {
                currentColors = colors;
                
                const chartData = data.map(item => [item.timestamp, item.value]);
                const startValue = data[0]?.value || 0;
                const endValue = data[data.length - 1]?.value || 0;
                const change = endValue - startValue;
                const changePercent = startValue > 0 ? (change / startValue) * 100 : 0;
                
                currentChart = Highcharts.chart('container', {
                    chart: {
                        type: 'line',
                        backgroundColor: 'transparent',
                        style: {
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                    },
                    
                    title: {
                        text: 'Evolução do Portfolio',
                        style: {
                            color: '#ffffff',
                            fontSize: '16px',
                            fontWeight: '600'
                        },
                        align: 'left',
                        margin: 20
                    },
                    
                    subtitle: {
                        text: 'Últimos 30 dias',
                        style: {
                            color: '#4a9eff',
                            fontSize: '12px'
                        },
                        align: 'left'
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
                    
                    yAxis: {
                        title: {
                            text: 'Valor (R$)',
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
                                return 'R$ ' + this.value.toLocaleString('pt-BR', {minimumFractionDigits: 0, maximumFractionDigits: 0});
                            }
                        },
                        gridLineColor: '#222222',
                        lineColor: '#333333'
                    },
                    
                    plotOptions: {
                        line: {
                            marker: {
                                enabled: false,
                                states: {
                                    hover: {
                                        enabled: true,
                                        radius: 4
                                    }
                                }
                            },
                            lineWidth: 3,
                            color: change >= 0 ? colors.success : colors.danger,
                            shadow: {
                                color: change >= 0 ? 'rgba(46, 213, 115, 0.3)' : 'rgba(255, 71, 87, 0.3)',
                                offsetX: 0,
                                offsetY: 2,
                                opacity: 0.5,
                                width: 3
                            }
                        }
                    },
                    
                    series: [{
                        name: 'Portfolio',
                        data: chartData,
                        color: change >= 0 ? colors.success : colors.danger,
                        tooltip: {
                            pointFormatter: function() {
                                const date = new Date(this.x).toLocaleDateString('pt-BR');
                                return '<span style="color:' + this.color + '">●</span> ' + 
                                       '<b>' + date + '</b><br/>' +
                                       'Valor: <b>R$ ' + this.y.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '</b>';
                            }
                        }
                    }],
                    
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        borderColor: colors.primary,
                        borderRadius: 8,
                        style: {
                            color: '#ffffff',
                            fontSize: '11px'
                        }
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

            // Função para criar gráfico de barras (categorias)
            function createBarChart(data, colors) {
                currentColors = colors;
                
                const chartData = data.map(item => ({
                    name: item.name,
                    y: item.value,
                    color: item.color
                }));
                
                currentChart = Highcharts.chart('container', {
                    chart: {
                        type: 'column',
                        backgroundColor: 'transparent',
                        style: {
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                    },
                    
                    title: {
                        text: 'Distribuição por Categoria',
                        style: {
                            color: '#ffffff',
                            fontSize: '16px',
                            fontWeight: '600'
                        },
                        align: 'left',
                        margin: 20
                    },
                    
                    subtitle: {
                        text: 'Valor investido por categoria',
                        style: {
                            color: '#4a9eff',
                            fontSize: '12px'
                        },
                        align: 'left'
                    },
                    
                    xAxis: {
                        categories: data.map(item => item.name),
                        labels: {
                            style: {
                                color: '#888888',
                                fontSize: '10px'
                            }
                        },
                        lineColor: '#333333',
                        tickColor: '#333333'
                    },
                    
                    yAxis: {
                        title: {
                            text: 'Valor (R$)',
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
                                return 'R$ ' + this.value.toLocaleString('pt-BR', {minimumFractionDigits: 0, maximumFractionDigits: 0});
                            }
                        },
                        gridLineColor: '#222222',
                        lineColor: '#333333'
                    },
                    
                    plotOptions: {
                        column: {
                            borderRadius: 4,
                            borderWidth: 0,
                            dataLabels: {
                                enabled: true,
                                style: {
                                    color: '#ffffff',
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    textOutline: 'none'
                                },
                                formatter: function() {
                                    return this.point.percentage.toFixed(1) + '%';
                                }
                            }
                        }
                    },
                    
                    series: [{
                        name: 'Valor',
                        data: chartData,
                        tooltip: {
                            pointFormatter: function() {
                                return '<span style="color:' + this.color + '">●</span> ' + 
                                       '<b>' + this.name + '</b><br/>' +
                                       'Valor: <b>R$ ' + this.y.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '</b><br/>' +
                                       'Percentual: <b>' + this.percentage.toFixed(1) + '%</b>';
                            }
                        }
                    }],
                    
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        borderColor: colors.primary,
                        borderRadius: 8,
                        style: {
                            color: '#ffffff',
                            fontSize: '11px'
                        }
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

            // Função para criar gráfico donut hierárquico
            function createDonutChart(data, totalValue, colors) {
                currentColors = colors;
                
                console.log('Creating donut chart with data:', data);
                
                // Primeiro, vamos criar um gráfico simples para testar
                const simpleData = data.map(item => ({
                    name: item.name,
                    y: item.value,
                    color: item.color
                }));
                
                console.log('Simple data:', simpleData);
                
                try {
                    currentChart = Highcharts.chart('container', {
                        chart: {
                            type: 'pie',
                            backgroundColor: 'transparent',
                            style: {
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                            }
                        },
                        
                        title: {
                            text: 'Distribuição do Portfolio',
                            style: {
                                color: '#ffffff',
                                fontSize: '16px',
                                fontWeight: '600'
                            },
                            align: 'left',
                            margin: 20
                        },
                        
                        subtitle: {
                            text: 'Total: R$ ' + totalValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
                            style: {
                                color: '#4a9eff',
                                fontSize: '12px'
                            },
                            align: 'left'
                        },
                        
                        plotOptions: {
                            pie: {
                                innerSize: '60%',
                                shadow: false,
                                center: ['50%', '50%'],
                                allowPointSelect: true,
                                cursor: 'pointer',
                                dataLabels: {
                                    enabled: true,
                                    style: {
                                        color: '#ffffff',
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        textOutline: 'none'
                                    },
                                    formatter: function() {
                                        return this.point.name + '<br/>' + this.percentage.toFixed(1) + '%';
                                    }
                                }
                            }
                        },
                        
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            borderColor: colors.primary,
                            borderRadius: 8,
                            style: {
                                color: '#ffffff',
                                fontSize: '11px'
                            },
                            pointFormatter: function() {
                                return '<span style="color:' + this.color + '">●</span> ' + 
                                       '<b>' + this.name + '</b><br/>' +
                                       'Valor: <b>R$ ' + this.y.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '</b><br/>' +
                                       'Percentual: <b>' + this.percentage.toFixed(1) + '%</b>';
                            }
                        },
                        
                        series: [{
                            name: 'Portfolio',
                            data: simpleData
                        }],
                        
                        credits: {
                            enabled: false
                        },
                        
                        exporting: {
                            enabled: false
                        }
                    });
                    
                    console.log('Simple donut chart created successfully');
                } catch (error) {
                    console.error('Error creating simple chart:', error);
                }
            }

            // Função para receber dados do React Native
            function updatePortfolioChart(chartType, data, totalValue, colors) {
                console.log('Updating chart:', chartType, data, totalValue);
                
                if (currentChart) {
                    currentChart.destroy();
                }
                
                // Aguardar um pouco para garantir que o DOM está pronto
                setTimeout(() => {
                    switch(chartType) {
                        case 'line':
                            createLineChart(data, totalValue, colors);
                            break;
                        case 'bar':
                            createBarChart(data, colors);
                            break;
                        case 'donut':
                            createDonutChart(data, totalValue, colors);
                            break;
                        default:
                            console.log('Unknown chart type:', chartType);
                    }
                }, 50);
            }

            // Escutar mensagens do React Native
            document.addEventListener('message', function(event) {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'updatePortfolioChart') {
                        updatePortfolioChart(message.chartType, message.data, message.totalValue, message.colors);
                    }
                } catch (e) {
                    console.log('Erro ao processar mensagem:', e);
                }
            });

            // Inicializar com gráfico padrão
            document.addEventListener('DOMContentLoaded', function() {
                console.log('DOM loaded, initializing chart...');
                setTimeout(() => {
                    try {
                        // Criar gráfico vazio inicial
                        currentChart = Highcharts.chart('container', {
                            chart: {
                                backgroundColor: 'transparent',
                                type: 'pie'
                            },
                            title: {
                                text: 'Carregando...',
                                style: {
                                    color: '#ffffff'
                                }
                            },
                            series: [{
                                name: 'Loading',
                                data: [{
                                    name: 'Carregando',
                                    y: 100,
                                    color: '#4a9eff'
                                }]
                            }],
                            credits: {
                                enabled: false
                            }
                        });
                        console.log('Initial chart created');
                    } catch (error) {
                        console.error('Error creating initial chart:', error);
                    }
                }, 100);
            });
        </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, { height, backgroundColor: 'transparent' }]}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4a9eff" />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
});
