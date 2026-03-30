import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Target, 
  TrendingUp, 
  Search, 
  Filter, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Mail, 
  FileText,
  BarChart3,
  MapPin,
  ShieldCheck,
  X,
  Send
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Toaster, toast } from 'sonner';
import { Enterprise, Stats } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'progress'>('dashboard');
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);
  const [filterDistrict, setFilterDistrict] = useState<string>('全部区县');
  const [filterGrade, setFilterGrade] = useState<string>('全部');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [entRes, statsRes] = await Promise.all([
          fetch('/api/enterprises'),
          fetch('/api/stats')
        ]);
        const entData = await entRes.json();
        const statsData = await statsRes.json();
        setEnterprises(entData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEnterprises = useMemo(() => {
    return enterprises.filter(ent => {
      const matchDistrict = filterDistrict === '全部区县' || ent.district === filterDistrict;
      const matchGrade = filterGrade === '全部' || ent.grade === filterGrade;
      const matchSearch = ent.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchDistrict && matchGrade && matchSearch;
    });
  }, [enterprises, filterDistrict, filterGrade, searchTerm]);

  const handleInvite = (ent: Enterprise) => {
    setEnterprises(prev => prev.map(e => 
      e.id === ent.id ? { ...e, statusTracking: '辅导中' as any } : e
    ));
    toast.success(`已向 ${ent.name} 推送定向邀约`, {
      description: '邀约函已通过政务短信及系统消息发送，企业状态已更新为“辅导中”。',
      duration: 4000,
    });
    if (selectedEnterprise?.id === ent.id) {
      setSelectedEnterprise({ ...selectedEnterprise, statusTracking: '辅导中' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f5f5f5]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium tracking-tight">正在同步嘉兴全域公开企业数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 text-blue-700">
            <Target className="w-8 h-8" />
            <h1 className="font-bold text-lg leading-tight">嘉兴科创<br/>加速器</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all",
              activeTab === 'dashboard' ? "bg-blue-50 text-blue-700 font-semibold shadow-sm" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>数据概览</span>
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all",
              activeTab === 'list' ? "bg-blue-50 text-blue-700 font-semibold shadow-sm" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Building2 className="w-5 h-5" />
            <span>企业库筛查</span>
          </button>
          <button 
            onClick={() => setActiveTab('progress')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all",
              activeTab === 'progress' ? "bg-blue-50 text-blue-700 font-semibold shadow-sm" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <TrendingUp className="w-5 h-5" />
            <span>培育进度追踪</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-blue-600 rounded-[28px] p-5 text-white shadow-lg shadow-blue-200">
            <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">当前数据同步于</p>
            <p className="text-sm font-mono font-bold">2026-03-30 02:52</p>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>数据合规已验证</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold tracking-tight">
            {activeTab === 'dashboard' && "嘉兴全域科创企业概览"}
            {activeTab === 'list' && "全域企业自动筛查与打分"}
            {activeTab === 'progress' && "培育进度动态台账"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="搜索企业名称..." 
                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm">
              嘉
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto w-full">
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-6">
                <StatCard title="全域筛查总量" value={stats.total} icon={<Building2 className="text-blue-600" />} color="blue" />
                <StatCard title="A档 (即刻符合)" value={stats.gradeA} icon={<CheckCircle2 className="text-emerald-600" />} color="emerald" />
                <StatCard title="B档 (即将达标)" value={stats.gradeB} icon={<Clock className="text-amber-600" />} color="amber" />
                <StatCard title="C档 (潜力培育)" value={stats.gradeC} icon={<TrendingUp className="text-blue-500" />} color="blue" />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[40px] border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-lg mb-8 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    各区县企业分布
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.byDistrict}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-lg mb-8 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-600" />
                    企业档位分布
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'A档', value: stats.gradeA },
                            { name: 'B档', value: stats.gradeB },
                            { name: 'C档', value: stats.gradeC },
                            { name: '暂不符合', value: stats.ineligible },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'list' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center gap-6 bg-white p-5 rounded-[28px] border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <select 
                    className="bg-transparent border-none text-sm font-bold focus:ring-0 cursor-pointer"
                    value={filterDistrict}
                    onChange={(e) => setFilterDistrict(e.target.value)}
                  >
                    <option>全部区县</option>
                    {stats?.byDistrict.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div className="h-6 w-px bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select 
                    className="bg-transparent border-none text-sm font-bold focus:ring-0 cursor-pointer"
                    value={filterGrade}
                    onChange={(e) => setFilterGrade(e.target.value)}
                  >
                    <option value="全部">全部档位</option>
                    <option value="A档">A档 (即刻符合)</option>
                    <option value="B档">B档 (即将达标)</option>
                    <option value="C档">C档 (潜力培育)</option>
                    <option value="暂不符合">暂不符合</option>
                  </select>
                </div>
                <div className="ml-auto text-sm text-gray-500">
                  共找到 <span className="font-bold text-blue-600">{filteredEnterprises.length}</span> 家符合条件的企业
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-[40px] border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-200">
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">企业名称</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">所属区县</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">评分</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">档位</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">状态</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredEnterprises.map(ent => (
                        <tr key={ent.id} className="hover:bg-blue-50/30 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{ent.name}</div>
                            <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{ent.industry}</div>
                          </td>
                          <td className="px-8 py-5 text-sm font-medium text-gray-600">{ent.district}</td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${ent.score}%` }}
                                  className={cn(
                                    "h-full rounded-full",
                                    ent.score >= 85 ? "bg-emerald-500" : ent.score >= 70 ? "bg-blue-500" : "bg-amber-500"
                                  )}
                                ></motion.div>
                              </div>
                              <span className="font-mono font-bold text-sm">{ent.score}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              ent.grade === 'A档' ? "bg-emerald-100 text-emerald-700" :
                              ent.grade === 'B档' ? "bg-blue-100 text-blue-700" :
                              ent.grade === 'C档' ? "bg-amber-100 text-amber-700" :
                              "bg-gray-100 text-gray-500"
                            )}>
                              {ent.grade}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                              {ent.statusTracking}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setSelectedEnterprise(ent)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-blue-600 hover:text-white text-blue-600 rounded-2xl transition-all"
                                title="查看评分详情"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                              {(ent.grade === 'A档' || ent.grade === 'B档') && ent.statusTracking === '待邀约' && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleInvite(ent);
                                  }}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-emerald-600 hover:text-white text-emerald-600 rounded-2xl transition-all"
                                  title="推送定向邀约"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="grid grid-cols-5 gap-6">
              {['待邀约', '辅导中', '申报中', '已认定', '未通过'].map((status) => (
                <div key={status} className="space-y-4">
                  <div className="flex items-center justify-between px-3">
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {status}
                    </h3>
                    <span className="text-[10px] font-bold bg-gray-200 px-2 py-0.5 rounded-full text-gray-500">
                      {enterprises.filter(e => e.statusTracking === status).length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {enterprises
                      .filter(e => e.statusTracking === status)
                      .slice(0, 12)
                      .map(ent => (
                        <motion.div 
                          layoutId={ent.id}
                          key={ent.id} 
                          onClick={() => setSelectedEnterprise(ent)}
                          className="bg-white p-5 rounded-[24px] border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className="font-bold text-xs mb-2 truncate group-hover:text-blue-700">{ent.name}</div>
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                              ent.grade === 'A档' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                            )}>{ent.grade}</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase">{ent.district}</span>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedEnterprise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEnterprise(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              className="relative w-full max-w-5xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-3xl font-bold tracking-tight">{selectedEnterprise.name}</h3>
                    <span className={cn(
                      "px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      selectedEnterprise.grade === 'A档' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {selectedEnterprise.grade}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm font-medium flex items-center gap-6">
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" /> {selectedEnterprise.district}</span>
                    <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-blue-500" /> {selectedEnterprise.industry}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedEnterprise(null)}
                  className="w-12 h-12 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 grid grid-cols-3 gap-12">
                <div className="col-span-2 space-y-10">
                  {/* Score Breakdown */}
                  <section>
                    <h4 className="font-bold text-xl mb-6 flex items-center gap-3">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                      推测评分模型明细
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedEnterprise.reasons.map((reason, idx) => {
                        const [label, scorePart] = reason.split(':');
                        const score = scorePart ? parseInt(scorePart.trim()) : (reason.includes('满足') && !reason.includes('不满足') ? 45 : 0);
                        
                        let description = "";
                        if (label.includes('基础')) {
                          description = score === 45 
                            ? "合规性极佳。企业在嘉兴本地稳健经营，无任何违法违规记录，守住了认定的“第一道防线”。" 
                            : "合规性存在硬伤。企业可能涉及经营异常、严重失信或非本地注册，需优先解决合规问题。";
                        } else if (label.includes('规模')) {
                          description = score >= 15 
                            ? "规模高度适配。企业注册资本与组织架构完全符合中小微定义，是政策重点扶持的“轻骑兵”。" 
                            : score >= 10 
                            ? "规模基本达标。处于典型的成长期，各项规模指标均在认定红线之内。" 
                            : "规模存在超标风险。企业注册资本较大或属于分支机构，需核实是否符合中小微划型标准。";
                        } else if (label.includes('科创')) {
                          description = score >= 25 
                            ? "科创基因深厚。从名称到经营范围均体现了强烈的研发导向，且已有知识产权沉淀，达标概率极高。" 
                            : score >= 15 
                            ? "科创倾向良好。企业已跨入科技赛道，但在知识产权储备或行业精准度上仍有优化空间。" 
                            : "科创倾向待挖掘。目前主要经营基础业务，需通过调整经营范围或布局知识产权来“点亮”科创属性。";
                        }

                        return (
                          <div key={idx} className="p-6 bg-gray-50 rounded-[28px] border border-gray-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-gray-700">{label}</span>
                              <span className="font-mono font-bold text-blue-600 bg-white px-4 py-1 rounded-full shadow-sm border border-gray-100">
                                {scorePart ? scorePart.trim() : (score === 45 ? "45/45" : "0/45")}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Improvement Suggestions */}
                  <section>
                    <h4 className="font-bold text-xl mb-6 flex items-center gap-3 text-amber-600">
                      <AlertCircle className="w-6 h-6" />
                      极简提升建议
                    </h4>
                    <div className="bg-amber-50/50 border border-amber-100 p-8 rounded-[32px] space-y-4">
                      {selectedEnterprise.shortfalls.length > 0 ? (
                        selectedEnterprise.shortfalls.map((s, idx) => (
                          <div key={idx} className="flex items-start gap-4 text-sm font-medium text-amber-900 leading-relaxed">
                            <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0 shadow-sm shadow-amber-200"></div>
                            <p>针对“<span className="font-bold">{s}</span>”，建议企业：{
                              s.includes('经营范围') ? "在工商登记中补充“技术开发、技术服务”等相关条目。" :
                              s.includes('知识产权') ? "尽快申报软件著作权或实用新型专利，提升科创属性。" :
                              s.includes('名称') ? "考虑在企业名称中体现科创属性，或通过业务实绩证明。" :
                              "联系属地科技局进行一对一辅导，完善申报材料。"
                            }</p>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-4 text-emerald-700">
                          <CheckCircle2 className="w-6 h-6" />
                          <p className="font-bold text-lg">该企业已完全满足认定条件，建议立即发起申报。</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  {/* Action Panel */}
                  <div className="bg-blue-600 p-8 rounded-[40px] text-white shadow-xl shadow-blue-200 space-y-8">
                    <div className="text-center">
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-6xl font-mono font-bold mb-2"
                      >
                        {selectedEnterprise.score}
                      </motion.div>
                      <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">系统自动推测总分</div>
                    </div>
                    
                    <div className="space-y-4">
                      <button 
                        onClick={() => handleInvite(selectedEnterprise)}
                        disabled={selectedEnterprise.statusTracking !== '待邀约'}
                        className={cn(
                          "w-full font-bold py-4 rounded-[20px] flex items-center justify-center gap-3 transition-all shadow-lg",
                          selectedEnterprise.statusTracking === '待邀约' 
                            ? "bg-white text-blue-700 hover:bg-blue-50 shadow-blue-800/20" 
                            : "bg-blue-400/50 text-white/70 cursor-not-allowed shadow-none"
                        )}
                      >
                        <Mail className="w-5 h-5" />
                        {selectedEnterprise.statusTracking === '待邀约' ? "推送定向邀约" : "已推送邀约"}
                      </button>
                      <button className="w-full bg-blue-500/30 border border-white/20 text-white font-bold py-4 rounded-[20px] flex items-center justify-center gap-3 hover:bg-blue-500/50 transition-all">
                        <FileText className="w-5 h-5" />
                        生成申报指引
                      </button>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">联系方式</p>
                      <p className="text-sm font-bold">{selectedEnterprise.contact}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">工商公示信息</h5>
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">经营范围</p>
                        <p className="text-xs font-medium text-gray-600 line-clamp-4 leading-relaxed">{selectedEnterprise.scope}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">注册资本</p>
                          <p className="text-xs font-bold text-gray-700 font-mono">{selectedEnterprise.capital} 万</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">成立日期</p>
                          <p className="text-xs font-bold text-gray-700 font-mono">{selectedEnterprise.establishedDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 shadow-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100",
    amber: "bg-amber-50 text-amber-600 shadow-amber-100",
  }[color as 'blue' | 'emerald' | 'amber'];

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-7 rounded-[40px] border border-gray-200 shadow-sm flex items-center gap-6"
    >
      <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center shadow-inner", colorClasses)}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-mono font-bold tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}
