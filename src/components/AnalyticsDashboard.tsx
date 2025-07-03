import React, { useMemo, useState } from 'react';
import { DesignCard } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Zap, 
  Users, 
  Heart,
  Download,
  Eye,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AnalyticsDashboardProps {
  designCards: DesignCard[];
  isOpen: boolean;
  onClose: () => void;
}

interface AnalyticsData {
  totalDesigns: number;
  todayDesigns: number;
  weeklyGrowth: number;
  popularTags: Array<{ tag: string; count: number }>;
  dailyActivity: Array<{ date: string; count: number }>;
  avgTimeToCreate: number;
  totalInteractions: number;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  designCards, 
  isOpen, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'tags'>('overview');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  // 计算分析数据
  const analyticsData: AnalyticsData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 按时间范围过滤
    const getFilteredCards = () => {
      switch (timeRange) {
        case 'week':
          return designCards.filter(card => new Date(card.createdAt) >= weekAgo);
        case 'month':
          return designCards.filter(card => new Date(card.createdAt) >= monthAgo);
        default:
          return designCards;
      }
    };

    const filteredCards = getFilteredCards();
    const todayCards = designCards.filter(card => 
      new Date(card.createdAt) >= today
    );

    // 计算标签统计
    const tagCount = new Map<string, number>();
    filteredCards.forEach(card => {
      const words = `${card.title} ${card.description}`.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 2) {
          tagCount.set(word, (tagCount.get(word) || 0) + 1);
        }
      });
    });

    const popularTags = Array.from(tagCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));

    // 计算每日活动
    const dailyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const count = designCards.filter(card => {
        const cardDate = new Date(card.createdAt);
        return cardDate.toDateString() === date.toDateString();
      }).length;
      
      dailyActivity.push({
        date: date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
        count
      });
    }

    // 计算增长率
    const thisWeekCount = designCards.filter(card => 
      new Date(card.createdAt) >= weekAgo
    ).length;
    const lastWeekCount = designCards.filter(card => {
      const cardDate = new Date(card.createdAt);
      return cardDate >= new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000) && 
             cardDate < weekAgo;
    }).length;
    const weeklyGrowth = lastWeekCount > 0 ? 
      ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100 : 0;

    return {
      totalDesigns: filteredCards.length,
      todayDesigns: todayCards.length,
      weeklyGrowth,
      popularTags,
      dailyActivity,
      avgTimeToCreate: 2.5, // 模拟数据
      totalInteractions: filteredCards.length * 3.2 // 模拟数据
    };
  }, [designCards, timeRange]);

  if (!isOpen) return null;

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: number;
    color?: string;
  }> = ({ icon, title, value, subtitle, trend, color = 'blue' }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg bg-${color}-100 flex items-center justify-center`}>
          <div className={`text-${color}-600`}>{icon}</div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center text-sm ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp size={14} className={trend < 0 ? 'rotate-180' : ''} />
            <span className="ml-1">{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      )}
    </div>
  );

  const BarChart: React.FC<{ data: Array<{ date: string; count: number }> }> = ({ data }) => {
    const maxCount = Math.max(...data.map(d => d.count));
    
    return (
      <div className="h-40 flex items-end justify-between gap-2 p-4">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="relative w-full bg-gray-200 rounded-t-lg overflow-hidden">
              <div 
                className="bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all duration-1000 flex items-end justify-center"
                style={{ 
                  height: `${maxCount > 0 ? (item.count / maxCount) * 120 : 0}px`,
                  minHeight: item.count > 0 ? '4px' : '0px'
                }}
              >
                {item.count > 0 && (
                  <span className="text-white text-xs font-medium mb-1">{item.count}</span>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-600 mt-2">{item.date}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 仪表盘容器 */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-modalSlideIn">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <BarChart3 size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">数据分析仪表盘</h2>
                <p className="text-purple-100">设计活动和趋势洞察</p>
              </div>
            </div>
            
            {/* 时间范围选择器 */}
            <div className="flex bg-white/10 rounded-lg p-1">
              {['week', 'month', 'all'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as any)}
                  className={`px-3 py-1 rounded-md text-sm transition-all duration-200 ${
                    timeRange === range 
                      ? 'bg-white text-purple-600' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {range === 'week' ? '本周' : range === 'month' ? '本月' : '全部'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="flex border-b border-gray-200">
          {[
            { key: 'overview', label: '概览', icon: <BarChart3 size={16} /> },
            { key: 'trends', label: '趋势', icon: <TrendingUp size={16} /> },
            { key: 'tags', label: '标签', icon: <Tag size={16} /> }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 统计卡片网格 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={<Zap size={20} />}
                  title="总设计稿"
                  value={analyticsData.totalDesigns}
                  color="purple"
                />
                <StatCard
                  icon={<Calendar size={20} />}
                  title="今日新增"
                  value={analyticsData.todayDesigns}
                  color="green"
                />
                <StatCard
                  icon={<TrendingUp size={20} />}
                  title="周增长率"
                  value={`${analyticsData.weeklyGrowth.toFixed(1)}%`}
                  trend={analyticsData.weeklyGrowth}
                  color="blue"
                />
                <StatCard
                  icon={<Heart size={20} />}
                  title="平均创建时间"
                  value={`${analyticsData.avgTimeToCreate}分钟`}
                  color="pink"
                />
              </div>

              {/* 活动图表 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Clock size={18} />
                    最近7天活动
                  </h3>
                </div>
                <BarChart data={analyticsData.dailyActivity} />
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-6">
              {/* 趋势指标 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <StatCard
                  icon={<Users size={20} />}
                  title="活跃度"
                  value={`${(analyticsData.totalDesigns / 7).toFixed(1)}/天`}
                  subtitle="平均每日设计稿数量"
                  color="indigo"
                />
                <StatCard
                  icon={<Eye size={20} />}
                  title="互动总数"
                  value={Math.round(analyticsData.totalInteractions)}
                  subtitle="点击、下载、分享等"
                  color="cyan"
                />
                <StatCard
                  icon={<Download size={20} />}
                  title="下载率"
                  value="73%"
                  subtitle="设计稿被下载的比例"
                  color="emerald"
                />
              </div>

              {/* 趋势分析 */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-4">智能洞察</h3>
                <div className="space-y-3">
                  {analyticsData.weeklyGrowth > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <TrendingUp size={16} className="text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-800">增长趋势良好</div>
                        <div className="text-sm text-green-600">
                          本周设计稿数量比上周增长了 {analyticsData.weeklyGrowth.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Zap size={16} className="text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-800">活跃时段</div>
                      <div className="text-sm text-blue-600">
                        根据数据显示，工作日的设计活动更加频繁
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">热门关键词</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {analyticsData.popularTags.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            index < 3 ? 'bg-purple-500' : 
                            index < 6 ? 'bg-blue-500' : 'bg-gray-400'
                          }`} />
                          <span className="font-medium text-gray-900">{item.tag}</span>
                        </div>
                        <span className="text-sm text-gray-600">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;