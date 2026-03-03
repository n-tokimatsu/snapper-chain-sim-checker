import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Play, FileCheck, Filter, BookOpen, Loader2, Settings } from 'lucide-react';

const DATASET_LIST = [
  { 
    id: "small", 
    title: "Small", 
    fileUrl: "./answers/A-small-answer.in",
    fallbackContent: "aaa \n" 
  },
  { 
    id: "large", 
    title: "Large", 
    fileUrl: "./answers/A-large-answer.in",
    fallbackContent: "Case #1: OFF\nCase #2: ON\nCase #3: OFF\nCase #4: OFF\nCase #5: OFF\nCase #6: ON\nCase #7: OFF\nCase #8: OFF\nCase #9: ON\nCase #10: OFF\nCase #11: OFF\nCase #12: ON\nCase #13: OFF\nCase #14: OFF\nCase #15: OFF\nCase #16: OFF\nCase #17: ON\nCase #18: OFF\nCase #19: OFF\nCase #20: OFF\nCase #21: ON\nCase #22: OFF\nCase #23: OFF\nCase #24: ON\nCase #25: ON\nCase #26: ON\nCase #27: OFF\nCase #28: OFF\nCase #29: ON\nCase #30: OFF\nCase #31: ON\nCase #32: OFF\nCase #33: ON\nCase #34: ON\nCase #35: OFF\nCase #36: OFF\nCase #37: ON\nCase #38: OFF\nCase #39: ON\nCase #40: OFF\nCase #41: OFF\nCase #42: ON\nCase #43: OFF\nCase #44: ON\nCase #45: OFF\nCase #46: ON\nCase #47: ON\nCase #48: ON\nCase #49: OFF\n(※実際のファイルは非常に大きいためプレビュー環境では省略しています)"
  }
];

const App = () => {
  const [selectedDataset, setSelectedDataset] = useState(DATASET_LIST[0].id);
  const [expected, setExpected] = useState("");
  const [isLoadingExpected, setIsLoadingExpected] = useState(false);
  
  const [actual, setActual] = useState("");
  const [hasCompared, setHasCompared] = useState(false);
  const [diffs, setDiffs] = useState([]); // 比較結果を保持するステートを復活
  
  const [showOnlyDiff, setShowOnlyDiff] = useState(false);
  const [isFlexibleMatch, setIsFlexibleMatch] = useState(false);

  const actualFileRef = useRef(null);

  // ファイル読み込み処理
  useEffect(() => {
    const loadExpectedFile = async () => {
      setIsLoadingExpected(true);
      const dataset = DATASET_LIST.find(p => p.id === selectedDataset);
      
      try {
        const response = await fetch(dataset.fileUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();
        setExpected(text);
      } catch (error) {
        setExpected(dataset.fallbackContent);
      } finally {
        setIsLoadingExpected(false);
        setHasCompared(false); 
      }
    };

    if (selectedDataset) {
      loadExpectedFile();
    }
  }, [selectedDataset]);

  const handleDatasetChange = (e) => setSelectedDataset(e.target.value);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setActual(event.target.result);
      setHasCompared(false); 
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  // 文字列の正規化処理
  const normalizeText = (text, flexible) => {
    if (text === undefined || text === null) return '(出力なし)';
    let result = String(text);
    
    if (flexible) {
      // 超・柔軟モード：全角半角、大文字小文字を統一し、すべての空白を削除して比較する
      result = result.normalize('NFKC').toLowerCase();
      result = result.replace(/\s/g, '');
      return result;
    }
    
    // 完全一致モード：一切の加工を行わない（行末の空白なども厳密に判定）
    return result;
  };

  // 比較実行ボタンを押した時の処理
  const handleCompareClick = () => {
    if (!actual.trim()) {
      alert("自分の出力ファイルが読み込まれていません。");
      return;
    }

    const expLines = expected.replace(/[\r\n]+$/, '').split(/\r?\n/);
    const actLines = actual.replace(/[\r\n]+$/, '').split(/\r?\n/);
    
    const maxLines = Math.max(expLines.length, actLines.length);
    const newDiffs = [];

    for (let i = 0; i < maxLines; i++) {
      const rawExp = expLines[i];
      const rawAct = actLines[i];
      
      const normExp = normalizeText(rawExp, isFlexibleMatch);
      const normAct = normalizeText(rawAct, isFlexibleMatch);
      
      const isMatch = normExp === normAct;
      
      newDiffs.push({
        line: i + 1,
        expected: rawExp !== undefined ? rawExp : '(出力なし)',
        actual: rawAct !== undefined ? rawAct : '(出力なし)',
        normExpected: normExp,
        normActual: normAct,
        isMatch
      });
    }

    setDiffs(newDiffs);
    setHasCompared(true);
  };

  // 不一致の行に含まれるスペースを可視化するヘルパー関数
  const renderTextWithVisibleSpaces = (text, isMatch) => {
    if (isMatch || text === '(出力なし)') return text;
    
    const parts = text.split(/([ \t]+)/);
    return parts.map((part, idx) => {
      if (/^[ \t]+$/.test(part)) {
        const visibleSpace = part.replace(/ /g, '␣').replace(/\t/g, '⇥');
        return (
          <span key={idx} className="bg-red-200 text-red-700 font-bold px-[2px] rounded border border-red-300 mx-[1px]" title="空白文字">
            {visibleSpace}
          </span>
        );
      }
      return part;
    });
  };

  const displayedDiffs = showOnlyDiff ? diffs.filter(d => !d.isMatch) : diffs;
  const totalCases = diffs.length;
  const correctCases = diffs.filter(d => d.isMatch).length;
  const isAllCorrect = totalCases > 0 && totalCases === correctCases;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-12">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <FileCheck size={32} />
            Output Checker for snapper-chain-sim
          </h1>
          <p className="mt-2 text-blue-100 text-sm md:text-base">
            用意された模範解答と、プログラムが出力したファイルを比較します。
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        
        {/* コントロールパネル */}
        <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <label className="font-bold flex items-center gap-2 text-gray-700 whitespace-nowrap">
              <BookOpen className="text-blue-500 flex-shrink-0" size={20} />
              データサイズ：
            </label>
            <select 
              className="w-full sm:max-w-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-gray-700 font-medium"
              value={selectedDataset}
              onChange={handleDatasetChange}
              disabled={isLoadingExpected}
            >
              {DATASET_LIST.map(dataset => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.title}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center justify-center sm:justify-start gap-2.5 bg-gray-50 hover:bg-gray-100 p-2.5 px-4 rounded-lg border border-gray-200 cursor-pointer transition shadow-sm w-full md:w-auto">
            <Settings size={18} className="text-gray-500 flex-shrink-0" />
            <input 
              type="checkbox" 
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 flex-shrink-0"
              checked={isFlexibleMatch}
              onChange={(e) => setIsFlexibleMatch(e.target.checked)}
            />
            <span className="text-sm font-medium text-gray-700 select-none">
              大文字小文字・余分な空白の違いを無視
            </span>
          </label>
        </div>

        {/* 入力エリア */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 min-h-[2rem]">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-700">
                <FileText className="text-blue-500 flex-shrink-0" size={20} />
                模範解答 (Expected)
              </h2>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold self-start sm:self-auto">サーバーファイル</span>
            </div>
            
            <div className="relative">
              <textarea
                className="w-full h-64 p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-mono text-sm resize-y cursor-not-allowed focus:outline-none whitespace-pre-wrap"
                value={expected}
                readOnly
              ></textarea>
              {isLoadingExpected && (
                <div className="absolute inset-0 bg-gray-100/80 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
                  <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
                  <p className="text-sm font-bold text-gray-600">ファイルを読み込み中...</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 min-h-[2rem]">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-700">
                <FileText className="text-indigo-500 flex-shrink-0" size={20} />
                自分の出力 (Actual)
              </h2>
              <div className="self-start sm:self-auto">
                <input 
                  type="file" 
                  accept=".txt,.out,.in" 
                  className="hidden" 
                  ref={actualFileRef}
                  onChange={handleFileUpload}
                />
                <button 
                  onClick={() => actualFileRef.current.click()}
                  className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1.5 px-3 rounded flex items-center gap-1 transition border border-indigo-200 font-medium whitespace-nowrap"
                >
                  <Upload size={16} /> ファイルを選択
                </button>
              </div>
            </div>
            <textarea
              className="w-full h-64 p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 font-mono text-sm resize-y cursor-not-allowed focus:outline-none whitespace-pre-wrap"
              value={actual}
              readOnly
              placeholder="右上の「ファイルを選択」ボタンから、プログラムが出力したファイルを読み込んでください。"
            ></textarea>
          </div>
        </div>

        {/* 比較アクション */}
        <div className="flex justify-center py-4">
          <button 
            onClick={handleCompareClick} 
            disabled={!actual || isLoadingExpected}
            className={`px-8 py-3 rounded-full font-bold shadow-lg transition transform flex items-center gap-2 ${
              actual && !isLoadingExpected
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 active:scale-95' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Play size={20} fill={actual ? "currentColor" : "none"} />
            比較を実行する
          </button>
        </div>

        {/* 結果エリア */}
        {hasCompared && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">比較結果</h2>
                <p className="text-gray-600 mt-1">
                  全 {totalCases} 行中、<span className="font-bold text-green-600">{correctCases}</span> 行が一致しました。
                </p>
              </div>

              <div className="flex-shrink-0">
                {isAllCorrect ? (
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg flex items-center gap-2 font-bold border border-green-200">
                    <CheckCircle className="text-green-600" />
                    All Correct! (完全一致)
                  </div>
                ) : (
                  <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg flex items-center gap-2 font-bold border border-red-200">
                    <AlertCircle className="text-red-600" />
                    {totalCases - correctCases} 箇所の不一致があります
                  </div>
                )}
              </div>
            </div>

            {!isAllCorrect && (
              <div className="mb-4 flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm bg-gray-100 hover:bg-gray-200 py-1.5 px-3 rounded transition border border-gray-200">
                  <input 
                    type="checkbox" 
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                    checked={showOnlyDiff}
                    onChange={(e) => setShowOnlyDiff(e.target.checked)}
                  />
                  <Filter size={16} />
                  <span>不一致の行のみ表示する</span>
                </label>
              </div>
            )}

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-sm whitespace-nowrap">
                    <th className="py-3 px-4 border-b w-16 text-center">行</th>
                    <th className="py-3 px-4 border-b w-16 text-center">判定</th>
                    <th className="py-3 px-4 border-b w-1/2 min-w-[200px]">模範解答 (Expected)</th>
                    <th className="py-3 px-4 border-b w-1/2 min-w-[200px]">自分の出力 (Actual)</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {displayedDiffs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-gray-500">
                        表示する差分がありません。
                      </td>
                    </tr>
                  ) : (
                    displayedDiffs.map((diff, idx) => (
                      <tr 
                        key={idx} 
                        className={`border-b last:border-0 ${diff.isMatch ? 'bg-white hover:bg-gray-50' : 'bg-red-50 hover:bg-red-100'}`}
                      >
                        <td className="py-2 px-4 border-r text-center text-gray-500 bg-gray-50">{diff.line}</td>
                        <td className="py-2 px-4 border-r text-center">
                          {diff.isMatch ? (
                            <CheckCircle size={20} className="text-green-500 mx-auto" />
                          ) : (
                            // エラー時、マウスホバーでどういう文字として判定されたか確認できるようにしました
                            <XCircle size={20} className="text-red-500 mx-auto cursor-help" title={isFlexibleMatch ? `【判定用テキスト】\n模範: ${diff.normExpected}\n自分: ${diff.normActual}` : ''} />
                          )}
                        </td>
                        <td className={`py-2 px-4 border-r font-mono break-words whitespace-pre-wrap ${!diff.isMatch && 'text-red-800'}`}>
                          {renderTextWithVisibleSpaces(diff.expected, diff.isMatch)}
                        </td>
                        <td className={`py-2 px-4 font-mono break-words whitespace-pre-wrap ${!diff.isMatch && 'text-red-800 font-bold'}`}>
                          {renderTextWithVisibleSpaces(diff.actual, diff.isMatch)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;