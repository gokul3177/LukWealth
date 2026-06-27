import { useState } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import API from '../utils/api';

const AiInsights = ({ viewUserId }) => {
    const [insights, setInsights] = useState([]);
    const [fraudFlags, setFraudFlags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const fetchInsights = async () => {
        setLoading(true);
        setError('');
        try {
            const params = viewUserId ? { userId: viewUserId } : {};
            const [insightsRes, fraudRes] = await Promise.all([
                API.get('/ai/insights', { params }),
                API.get('/ai/fraud-check', { params })
            ]);
            setInsights(insightsRes.data);
            setFraudFlags(fraudRes.data.flagged);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch AI insights.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        if (insights.length === 0) {
            fetchInsights();
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={handleOpen}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-violet-500/25 hover:scale-[1.02] transition"
            >
                <Sparkles size={14} /> AI Advisor
            </button>
        );
    }

    const getIcon = (type) => {
        switch(type) {
            case 'positive': return <CheckCircle className="text-emerald-500" size={18} />;
            case 'warning': return <AlertTriangle className="text-amber-500" size={18} />;
            default: return <Info className="text-blue-500" size={18} />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-violet-500" size={20} />
                        <h2 className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm">AI Financial Advisor</h2>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 space-y-4">
                            <Sparkles className="text-violet-400 animate-pulse" size={32} />
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold animate-pulse">Analyzing financial patterns...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {fraudFlags.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
                                        <AlertTriangle size={14} /> Security & Fraud Alerts
                                    </h3>
                                    {fraudFlags.map((flag, idx) => (
                                        <div key={idx} className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/30 p-4 rounded-xl flex items-start gap-3">
                                            <AlertTriangle className="text-rose-500 mt-0.5 shrink-0" size={16} />
                                            <div>
                                                <p className="font-bold text-rose-700 dark:text-rose-400 text-sm">Unusual Transaction Detected</p>
                                                <p className="text-rose-600/80 dark:text-rose-300/80 text-xs mt-1">{flag.reason}</p>
                                                <p className="text-rose-500/60 dark:text-rose-400/50 text-[10px] mt-2 font-mono uppercase">Record ID: {flag.recordId} | {new Date(flag.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-3">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <Sparkles size={14} /> Personalized Insights
                                </h3>
                                {insights.map((insight, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-600/50 p-4 rounded-xl flex items-start gap-3 transition hover:shadow-md">
                                        <div className="mt-0.5 shrink-0">{getIcon(insight.type)}</div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{insight.title}</p>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{insight.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Powered by OpenAI</p>
                    <button onClick={fetchInsights} disabled={loading} className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline disabled:opacity-50">
                        Refresh Insights
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiInsights;
