import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, CheckCircle, ChevronRight, FileText, LayoutDashboard, 
  Settings, Award, Upload, Link as LinkIcon, AlertCircle, ChevronLeft,
  Info, ExternalLink, Save, CheckSquare, Edit3, Download, PlayCircle
} from 'lucide-react';

// --- TYPES & INTERFACES ---

interface User {
  name: string;
  role: string;
}

interface xAPIConfig {
  endpoint: string;
  key: string;
  secret: string;
  enabled: boolean;
}

interface LocalTelemetryRecord {
  recordedAt: string;
  statement: any;
}

interface AILog {
  tool: string;
  goal: string;
  prompts: string;
  output: string;
  kept: string;
  changed: string;
  inclusive: 'Yes' | 'No' | 'Unsure' | '';
  inclusiveDetails: string;
  risksChecked: string[];
  verification: string;
}

interface Submission {
  chapterId: number;
  infographicUrl: string; // Object URL for local demo
  article: string;
  evidence: string;
  reflections: string[]; // 3 answers
  usedAI: boolean;
  aiLog?: AILog;
  submissionType: 'comment' | 'post';
  linkedinUrl: string;
  likes: number;
  completedAt: string;
}

interface ChapterProgress {
  chapterId: number;
  learnVisited: boolean;
  quizScore: number | null;
  completed: boolean;
}

interface Chapter {
  id: number;
  title: string;
  authors: string;
  linkedinUrl: string;
  pdfUrl?: string;
  isIntro?: boolean;
}

// --- DATA ---

const CHAPTERS: Chapter[] = [
  { id: 0, title: "Start Here: Welcome to The OECD Explorer", authors: "Course Introduction", linkedinUrl: "#", isIntro: true },
  { id: 1, title: "Exploring Effective Uses of Generative AI in Education: An Overview", authors: "Stéphan Vincent-Lancrin and Quentin Vidal", linkedinUrl: "https://www.linkedin.com/posts/rlethcoe_cognitive-offloading-vs-cognitive-scaffolding-activity-7420107953019645952-sOyR/", pdfUrl: "https://drive.google.com/file/d/1M4f9NHq0x4WIzhgLeF0o5AL56LwWnUjQ/view?usp=drive_link" },
  { id: 2, title: "Generative AI for Human Skill Development and Assessment", authors: "Dragan Gašević and Lixiang Yan", linkedinUrl: "https://www.linkedin.com/posts/rlethcoe_the-mirage-of-false-mastery-activity-7420468298275860480-4WC7/", pdfUrl: "https://drive.google.com/file/d/1Eo537iCYIkEodm2Ht7G5EWm79GyCRIEm/view?usp=drive_link" },
  { id: 3, title: "Learning with Dialogue-Based AI Tutors", authors: "Yuheng Li and Xiangen Hu", linkedinUrl: "https://www.linkedin.com/posts/rlethcoe_from-answer-dispenser-to-cognitive-coach-activity-7421207671627776000-5P2g/", pdfUrl: "https://drive.google.com/file/d/1rNEuAvDM4oMV7_SgxOHVlJULie9B0_Mj/view?usp=drive_link" },
  { id: 4, title: "Fostering Collaborative Learning with AI", authors: "Sebastian Strauß and Nikol Rummel", linkedinUrl: "https://www.linkedin.com/posts/rlethcoe_fostering-collaborative-learning-with-generative-activity-7421564400098140160-hyo_/", pdfUrl: "https://drive.google.com/file/d/14PpIhVG4kmMGeINTKl-1T0lUPu_-CGSn/view?usp=drive_link" },
  { id: 5, title: "Developing Creativity with Generative AI", authors: "Interview by Stéphan Vincent-Lancrin and Quentin Vidal", linkedinUrl: "https://www.linkedin.com/posts/rlethcoe_developing-creativity-with-generative-ai-activity-7421926336006635520-9dA3/", pdfUrl: "https://drive.google.com/file/d/17Yrc60COAPd3mLF_dcyn3qZ_Ng1pesmg/view?usp=drive_link" },
  { id: 6, title: "AI in Education Unplugged", authors: "Interview by Stéphan Vincent-Lancrin and Quentin Vidal", linkedinUrl: "https://www.linkedin.com/posts/rlethcoe_ai-in-education-unplugged-activity-7422278648449318912-8hTZ/", pdfUrl: "https://drive.google.com/file/d/1rNyYcuWWhHGEN3zEvOTOfr1uJxod4sWs/view?usp=drive_link" },
  { id: 7, title: "Framework for Teacher-AI Teaming in Education", authors: "Mutlu Cukurova", linkedinUrl: "https://www.linkedin.com/posts/rlethcoe_a-conceptual-framework-for-teacher-ai-teaming-activity-7422654752078905344-PcJT/", pdfUrl: "https://drive.google.com/file/d/1C0d-IXo2OHRwpiJtHs8TaqvbkeCZZwTg/view?usp=drive_link" },
  { id: 8, title: "Transitioning to Educational-Oriented Generative AI", authors: "Paraskevi Topali, Alejandro Ortega-Arranz and Inge Molenaar", linkedinUrl: "https://www.linkedin.com/posts/rlethcoe_educational-oriented-generative-activity-7423777592421490688-SLXD/", pdfUrl: "https://drive.google.com/file/d/10kw1_rn-T45_-9-1Cr7yGVFR9LdKiYrc/view?usp=drive_link" },
  { id: 9, title: "Generative AI as a Teaching Assistant", authors: "Ryan Baker, Xiner Liu, Mamta Shah, et al.", linkedinUrl: "https://www.linkedin.com/posts/rlethcoe_generative-ai-as-a-teaching-assistant-activity-7424092325708226560-j2XY/", pdfUrl: "https://drive.google.com/file/d/1ydsIdp1akJZiwUoG_blniwfOg8yoBnxu/view?usp=drive_link" },
  { id: 10, title: "Generative AI Tools to Support Teachers", authors: "Interview by Stéphan Vincent-Lancrin and Quentin Vidal", linkedinUrl: "https://www.linkedin.com/posts/rlethcoe_generative-ai-tools-to-support-teachers-activity-7424456804581158912-8wJR/", pdfUrl: "https://drive.google.com/file/d/1zSItUj2GFw-kkvNTbJXWbM4O5_W5p5S1/view?usp=drive_link" },
  { id: 11, title: "AI in Institutional Workflows", authors: "Zachary Pardos and Conrad Borchers", linkedinUrl: "https://www.linkedin.com/posts/rlethcoe_ai-exposes-the-credit-hour-lie-activity-7424828566330253312-2aWu/", pdfUrl: "https://drive.google.com/file/d/1TtAFE_2qQ7MkvO25srr8ZaP1i0R8h6Xs/view?usp=drive_link" },
  { id: 12, title: "Generative AI for Standardised Assessments", authors: "Interview by Stéphan Vincent-Lancrin and Quentin Vidal", linkedinUrl: "https://www.linkedin.com/posts/rlethcoe_generative-ai-for-standardized-assessments-activity-7425179448464814080-LVDl/", pdfUrl: "https://drive.google.com/file/d/1tUySEt2b2L51wcXKwVCVfZQLwps7kmqk/view?usp=drive_link" },
  { id: 13, title: "Generative AI and Transformation of Scientific Research", authors: "Dominique Guellec and Stéphan Vincent-Lancrin", linkedinUrl: "https://www.linkedin.com/posts/rlethcoe_how-generative-ai-is-transforming-scientific-activity-7425545051969183744-eplo/", pdfUrl: "https://drive.google.com/file/d/1UGFQfuZ3-tWfs7Cr5pS8Dtf0Ocbs0gPr/view?usp=drive_link" }
];

const REFLECTION_QUESTIONS = [
  "NotebookLM knows the chapter. It doesn't know your students, your program, or your Monday morning. What did you have to add, cut, or reframe to make this actually useful for your newsletter audience -- and how did you decide that?",
  "Before you finalized your infographic or article, did you go back to the actual PDF to confirm anything NotebookLM pulled -- and if so, what triggered that instinct? If not, what would have made you want to check?",
  "If a colleague asked you to explain the main idea from this chapter at lunch tomorrow, would you reach for your infographic -- or do you actually know it well enough to just talk about it? What does your answer tell you?"
];

const RISK_OPTIONS = ["Accuracy", "Bias", "Privacy", "Feasibility", "Accessibility"];

// Placeholder Quiz
const MOCK_QUIZ = [
  { q: "When integrating AI tools, what is the primary pedagogical goal?", options: ["Replacing teacher assessment", "Enhancing cognitive scaffolding", "Reducing total curriculum hours", "Automating all parent communication"], a: 1 },
  { q: "Which of the following represents a 'deficit framing' trap in AI use?", options: ["Using AI to translate materials", "Prompting AI to 'simplify for lower-performing students'", "Generating multiple case study examples", "Using AI to analyze aggregate trends"], a: 1 },
  { q: "In the context of the OECD report, 'Human Skill Development' emphasizes:", options: ["Memorization speed", "Prompt engineering solely", "Critical thinking and socio-emotional skills", "Typing proficiency"], a: 2 },
  { q: "A dialogue-based AI tutor is best utilized when it:", options: ["Gives direct answers immediately", "Acts as a Socratic coach", "Grades essays without human review", "Replaces peer collaboration"], a: 1 },
  { q: "When sharing your Front Page Package, what is the required deliverable format?", options: ["A 5-page PDF essay", "An infographic and 150-220 word mini-article", "A 10-minute podcast", "A slide deck"], a: 1 }
];

// --- XAPI CLIENT ---

class xAPI {
  static sendStatement(config: xAPIConfig, user: User | null, verbId: string, verbDisplay: string, objectId: string, objectName: string, score?: number) {
    if (!user) return;
    const statement = {
      actor: { mbox: `mailto:${user.name.replace(/\s+/g, '').toLowerCase()}@example.com`, name: user.name, objectType: "Agent" },
      verb: { id: verbId, display: { "en-US": verbDisplay } },
      object: { id: objectId, definition: { name: { "en-US": objectName } }, objectType: "Activity" },
      ...(score !== undefined && { result: { score: { raw: score, min: 0, max: 100 } } })
    };

    // Always store a local telemetry record for export.
    try {
      const key = 'oecd_telemetry';
      const existing = localStorage.getItem(key);
      const parsed: LocalTelemetryRecord[] = existing ? JSON.parse(existing) : [];
      parsed.push({ recordedAt: new Date().toISOString(), statement });
      localStorage.setItem(key, JSON.stringify(parsed));
    } catch (e) {
      console.warn('[Local Telemetry] Unable to write telemetry record', e);
    }

    if (config.enabled && config.endpoint) {
      console.log("[xAPI Real Mode - Emitting Statement]", statement);
    } else {
      console.log("[xAPI Mock Mode - Config Disabled/Missing]", statement);
    }
  }
}

// --- APP COMPONENT ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Record<number, ChapterProgress>>({});
  const [submissions, setSubmissions] = useState<Record<number, Submission>>({});
  const [xApiConfig, setXApiConfig] = useState<xAPIConfig>({ endpoint: '', key: '', secret: '', enabled: false });
  const [route, setRoute] = useState<string>('onboard');
  const [activeChapter, setActiveChapter] = useState<number | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('oecd_user');
    const savedProgress = localStorage.getItem('oecd_progress');
    const savedSubmissions = localStorage.getItem('oecd_submissions');
    const savedXapi = localStorage.getItem('oecd_xapi');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setRoute('dashboard');
    }
    if (savedProgress) setProgress(JSON.parse(savedProgress));
    if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));
    if (savedXapi) setXApiConfig(JSON.parse(savedXapi));
  }, []);

  useEffect(() => { if (user) localStorage.setItem('oecd_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('oecd_progress', JSON.stringify(progress)); }, [progress]);
  useEffect(() => { localStorage.setItem('oecd_submissions', JSON.stringify(submissions)); }, [submissions]);
  useEffect(() => { localStorage.setItem('oecd_xapi', JSON.stringify(xApiConfig)); }, [xApiConfig]);

  const totalCompleted = Object.values(progress).filter(p => p.completed).length;

  const exportLocalState = () => {
    const telemetryRaw = localStorage.getItem('oecd_telemetry');
    const telemetry = telemetryRaw ? JSON.parse(telemetryRaw) : [];
    const payload = {
      schema: 'oecd-explorer-export',
      version: 1,
      exportedAt: new Date().toISOString(),
      user,
      progress,
      submissions,
      xApiConfig,
      telemetry
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oecd-explorer-export-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const importLocalState = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text);

    // Minimal schema check
    if (!parsed || parsed.schema !== 'oecd-explorer-export') {
      alert('That file does not look like an OECD Explorer export.');
      return;
    }

    if (parsed.user) setUser(parsed.user);
    if (parsed.progress) setProgress(parsed.progress);
    if (parsed.submissions) setSubmissions(parsed.submissions);
    if (parsed.xApiConfig) setXApiConfig(parsed.xApiConfig);
    if (Array.isArray(parsed.telemetry)) localStorage.setItem('oecd_telemetry', JSON.stringify(parsed.telemetry));

    setRoute(parsed.user ? 'dashboard' : 'onboard');
  };

  const renderRoute = () => {
    if (route === 'onboard') return <Onboarding setUser={setUser} setRoute={setRoute} xApiConfig={xApiConfig} />;
    if (route === 'dashboard') return <Dashboard progress={progress} setRoute={setRoute} setActiveChapter={setActiveChapter} />;
    if (route === 'chapter' && activeChapter !== null) {
      const currentChapter = CHAPTERS.find(c => c.id === activeChapter)!;
      if (currentChapter.isIntro) {
        return <IntroModule 
          progress={progress[activeChapter] || { chapterId: activeChapter, learnVisited: false, quizScore: null, completed: false }}
          setProgress={(p: ChapterProgress) => setProgress(prev => ({ ...prev, [activeChapter]: p }))}
          setRoute={setRoute} 
        />;
      }
      return <ChapterStepper 
        chapter={currentChapter} 
        progress={progress[activeChapter] || { chapterId: activeChapter, learnVisited: false, quizScore: null, completed: false }}
        submission={submissions[activeChapter]}
        setProgress={(p: ChapterProgress) => setProgress(prev => ({ ...prev, [activeChapter]: p }))}
        setSubmission={(s: Submission) => setSubmissions(prev => ({ ...prev, [activeChapter]: s }))}
        setRoute={setRoute}
        user={user}
        xApiConfig={xApiConfig}
      />;
    }
    if (route === 'portfolio') return <Portfolio submissions={submissions} setRoute={setRoute} onExport={exportLocalState} onImport={importLocalState} />;
    if (route === 'certificate') return <Certificate user={user} totalCompleted={totalCompleted} setRoute={setRoute} />;
    if (route === 'settings') return <SettingsPage config={xApiConfig} setConfig={setXApiConfig} setRoute={setRoute} />;
    if (route === 'admin') return <AdminNewsletter submissions={submissions} setRoute={setRoute} />;
    return <Dashboard progress={progress} setRoute={setRoute} setActiveChapter={setActiveChapter} />;
  };

  return (
    <div className="min-h-screen bg-[#3a0311] text-slate-100 font-sans selection:bg-rose-500/30 text-base">
      {user && route !== 'onboard' && (
        <header className="bg-[#240109] border-b border-rose-900/50 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setRoute('dashboard')}>
              <div className="w-8 h-8 rounded bg-rose-800 flex items-center justify-center font-bold text-white shadow-inner">
                OE
              </div>
              <h1 className="font-semibold hidden sm:block tracking-wide">
                The OECD Explorer
              </h1>
            </div>
            
            <nav className="flex items-center gap-1 md:gap-4 font-medium">
              <button onClick={() => setRoute('dashboard')} className={`px-3 py-2 rounded-md hover:bg-rose-900/40 transition-colors ${route === 'dashboard' ? 'text-rose-300' : 'text-slate-300'}`}>
                <LayoutDashboard className="w-5 h-5 inline mr-2" />
                <span className="hidden md:inline">Dashboard</span>
              </button>
              <button onClick={() => setRoute('portfolio')} className={`px-3 py-2 rounded-md hover:bg-rose-900/40 transition-colors ${route === 'portfolio' ? 'text-rose-300' : 'text-slate-300'}`}>
                <FileText className="w-5 h-5 inline mr-2" />
                <span className="hidden md:inline">Portfolio</span>
              </button>
              {totalCompleted === 14 && (
                <button onClick={() => setRoute('certificate')} className="px-3 py-2 rounded-md bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/30 transition-colors">
                  <Award className="w-5 h-5 inline mr-2" />
                  Certificate
                </button>
              )}
              <div className="h-6 w-px bg-rose-900/50 mx-2"></div>
              <button onClick={() => setRoute('settings')} className="p-2 rounded-full hover:bg-rose-900/40 text-slate-400 transition-colors" title="Settings">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-end ml-2">
                <span className="text-sm font-semibold text-rose-200">{user.name}</span>
                <span className="text-sm text-rose-400/70 uppercase">{totalCompleted}/14 Done</span>
              </div>
            </nav>
          </div>
        </header>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">
        {renderRoute()}
      </main>
    </div>
  );
}

// --- PAGE COMPONENTS ---

function Onboarding({ setUser, setRoute, xApiConfig }: any) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const userObj = { name, role };
    setUser(userObj);
    xAPI.sendStatement(xApiConfig, userObj, "http://adlnet.gov/expapi/verbs/launched", "launched", "http://oecd2026.edu/course", "OECD Digital Education Outlook 2026");
    setRoute('dashboard');
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-[#2a040e] p-8 rounded-2xl border border-rose-900/50 shadow-2xl">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 mx-auto bg-rose-900 rounded-2xl flex items-center justify-center mb-4 border border-rose-700">
          <BookOpen className="w-8 h-8 text-rose-200" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">The OECD Explorer</h1>
        <p className="text-rose-300 text-sm">March 2026 Edition • Production Studio</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Your Full Name (Required)</label>
          <input 
            type="text" required value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-[#1a0208] border border-rose-900/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Role / Context (Optional)</label>
          <input 
            type="text" value={role} onChange={e => setRole(e.target.value)}
            className="w-full bg-[#1a0208] border border-rose-900/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
            placeholder="e.g. Science Teacher"
          />
        </div>
        <button type="submit" className="w-full bg-rose-700 hover:bg-rose-600 text-white font-medium py-3 rounded-lg transition-colors shadow-lg shadow-rose-900/20">
          Enter the Studio
        </button>
      </form>
    </div>
  );
}

function Dashboard({ progress, setRoute, setActiveChapter }: any) {
  const completedCount = Object.values(progress).filter((p: any) => p.completed).length;

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-[#2a040e] rounded-2xl p-8 border border-rose-900/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Production Dashboard</h2>
          <p className="text-rose-200/80 max-w-xl text-base leading-relaxed">
            Welcome to the studio. Review the 14 modules, publish your insights, and earn your micro-credential. Start with the Introduction Module below.
          </p>
        </div>
        <div className="bg-[#1a0208] p-6 rounded-xl border border-rose-900/50 flex flex-col items-center min-w-[160px]">
          <div className="text-4xl font-black text-rose-400 mb-1">{completedCount}<span className="text-xl text-rose-800">/14</span></div>
          <div className="text-sm uppercase tracking-widest text-slate-400 font-semibold">Completed</div>
          <div className="w-full bg-rose-950 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-rose-500 h-full transition-all duration-1000" style={{ width: `${(completedCount/14)*100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mb-4">
        <button onClick={() => setRoute('admin')} className="text-sm text-rose-400 hover:text-rose-300 flex items-center">
          <Settings className="w-4 h-4 mr-1" /> Newsletter Admin View (Mock)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {CHAPTERS.map(chapter => {
          const isDone = progress[chapter.id]?.completed;
          const score = progress[chapter.id]?.quizScore;
          
          return (
            <div key={chapter.id} className={`p-6 rounded-xl border transition-all duration-300 flex flex-col ${isDone ? 'bg-[#1a050b] border-green-900/30' : 'bg-[#2a040e] border-rose-900/30 hover:border-rose-700/50 shadow-lg'}`}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-bold uppercase text-rose-500/70">
                  {chapter.id === 0 ? 'Intro' : `Module ${chapter.id}`}
                </span>
                {isDone && <CheckCircle className="w-6 h-6 text-green-500" />}
              </div>
              <h3 className="font-semibold text-lg leading-tight mb-2 text-slate-100 flex-grow">
                {chapter.title}
              </h3>
              <p className="text-sm text-slate-400 mb-6">{chapter.authors}</p>
              
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {score !== undefined && score !== null && (
                    <span className="text-sm px-2 py-1 rounded bg-black/30 border border-white/5 text-slate-300">
                      Quiz: {score}%
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => { setActiveChapter(chapter.id); setRoute('chapter'); }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDone ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-rose-700 hover:bg-rose-600 text-white shadow-md'}`}
                >
                  {isDone ? 'Review' : 'Start'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- INTRO MODULE (CHAPTER 0) ---

function IntroModule({ progress, setProgress, setRoute }: any) {
  const completeIntro = () => {
    setProgress({ ...progress, completed: true });
    setRoute('dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in">
      <button onClick={() => setRoute('dashboard')} className="text-rose-400 hover:text-rose-300 mb-6 flex items-center transition-colors">
        <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
      </button>

      <div className="bg-[#2a040e] border border-rose-900/50 rounded-2xl p-8 md:p-12 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center">
          <PlayCircle className="w-8 h-8 mr-3 text-rose-500" /> Start Here: How This Works
        </h1>
        
        <div className="space-y-6 text-slate-200 text-base leading-relaxed">
          <p>
            Welcome to The OECD Explorer Studio. This platform was built using <strong>Google Gemini</strong> to serve as your interactive launchpad for the OECD Digital Education Outlook 2026.
          </p>
          
          <div className="bg-[#1a0208] p-6 rounded-xl border border-rose-900/30">
            <h3 className="text-rose-400 font-bold mb-3 uppercase tracking-wider">Your Goal</h3>
            <p className="mb-0">
              Complete all 14 modules to earn a verifiable Micro-Credential. You will consume the research, test your knowledge, experiment with AI, and publish actionable takeaways for your peers.
            </p>
          </div>

          <div className="bg-[#1a0208] p-6 rounded-xl border border-rose-900/30">
            <h3 className="text-rose-400 font-bold mb-3 uppercase tracking-wider">The Workflow Rhythm</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Learn:</strong> Download the chapter PDF or visit the LinkedIn hub.</li>
              <li><strong>Check:</strong> Pass a short scenario-based quiz.</li>
              <li><strong>Investigate:</strong> Use AI tools to test the chapter's concepts.</li>
              <li><strong>Build:</strong> Create a summary infographic and a mini-article.</li>
              <li><strong>Publish:</strong> Share your package on LinkedIn.</li>
            </ul>
          </div>

          <div className="bg-blue-950/30 p-6 rounded-xl border border-blue-900/50">
            <h3 className="text-blue-400 font-bold mb-3 flex items-center">
              <Info className="w-5 h-5 mr-2" /> NotebookLM Setup
            </h3>
            <p className="mb-4">
              To get the most out of this course, we highly recommend setting up a <strong>Google NotebookLM</strong> notebook. You can use it to synthesize knowledge across all chapters.
            </p>
            <ol className="list-decimal pl-6 space-y-2 mb-6 text-blue-100">
              <li>Open <a href="https://notebooklm.google.com/" target="_blank" rel="noreferrer" className="text-blue-300 underline hover:text-white">NotebookLM</a> and create a new notebook.</li>
              <li>In each module of this course, use the "Download Chapter PDF" link.</li>
              <li>Upload these PDFs into your notebook as sources.</li>
              <li>Use the notebook during the "Investigation" step to brainstorm your mini-articles!</li>
            </ol>
            <a href="https://support.google.com/notebooklm/answer/16164461?hl=en&ref_topic=16164070&sjid=17542799692578803692-NC" target="_blank" rel="noreferrer" className="inline-block bg-blue-900/50 hover:bg-blue-800 border border-blue-500 text-blue-200 px-4 py-2 rounded transition-colors text-sm">
              Learn how to use NotebookLM <ExternalLink className="w-4 h-4 ml-1 inline" />
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-rose-900/50 flex justify-end">
          <button onClick={completeIntro} className="bg-rose-700 hover:bg-rose-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-colors">
            Mark Complete & Start Course
          </button>
        </div>
      </div>
    </div>
  );
}

// --- CHAPTER STEPPER ---

function ChapterStepper({ chapter, progress, submission, setProgress, setSubmission, setRoute, user, xApiConfig }: any) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { title: "Assign", id: "desk" },
    { title: "Learn", id: "learn" },
    { title: "Quiz", id: "quiz" },
    { title: "Explore", id: "investigate" },
    { title: "Build", id: "build" },
    { title: "Publish", id: "publish" }
  ];

  const handleNext = () => { if (activeStep < steps.length - 1) { setActiveStep(prev => prev + 1); window.scrollTo(0, 0); } };
  const handlePrev = () => { if (activeStep > 0) { setActiveStep(prev => prev - 1); window.scrollTo(0, 0); } };

  const handleMarkCompleted = (data: Partial<Submission>) => {
    const finalSubmission = { ...submission, ...data, chapterId: chapter.id, completedAt: new Date().toISOString() };
    setSubmission(finalSubmission);
    setProgress({ ...progress, completed: true });
    xAPI.sendStatement(xApiConfig, user, "http://adlnet.gov/expapi/verbs/completed", "completed", `http://oecd2026.edu/course/chapter/${chapter.id}`, `Chapter ${chapter.id}: ${chapter.title}`);
    setRoute('dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <button onClick={() => setRoute('dashboard')} className="text-rose-400 hover:text-rose-300 mb-6 flex items-center transition-colors">
        <ChevronLeft className="w-5 h-5 mr-1" /> Back to Dashboard
      </button>

      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          <span className="text-rose-500">Module {chapter.id}:</span> {chapter.title}
        </h1>
        <p className="text-slate-400 text-base">{chapter.authors}</p>
      </div>

      <div className="flex w-full justify-between relative mb-12 px-2">
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-rose-900/50 -z-10"></div>
        {steps.map((step, idx) => {
          const isPassed = activeStep > idx;
          const isActive = activeStep === idx;
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold border-2 transition-colors ${isActive ? 'border-rose-500 bg-rose-500/20 text-rose-300' : isPassed ? 'border-green-600 bg-green-600/20 text-green-400' : 'border-rose-900/50 bg-[#1a0208] text-slate-500'}`}>
                {isPassed ? <CheckCircle className="w-5 h-5" /> : idx + 1}
              </div>
              <div className={`mt-2 text-sm font-semibold text-center ${isActive ? 'text-white' : isPassed ? 'text-slate-300' : 'text-slate-500'}`}>
                {step.title}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#2a040e] border border-rose-900/50 rounded-2xl p-6 md:p-10 shadow-xl min-h-[400px]">
        {activeStep === 0 && <StepAssignment onNext={handleNext} />}
        {activeStep === 1 && <StepLearn chapter={chapter} onNext={() => { setProgress({ ...progress, learnVisited: true }); handleNext(); }} onPrev={handlePrev} />}
        {activeStep === 2 && <StepQuiz savedScore={progress.quizScore} onPass={(score: number) => {
            setProgress({ ...progress, quizScore: score });
            xAPI.sendStatement(xApiConfig, user, "http://adlnet.gov/expapi/verbs/passed", "passed", `http://oecd2026.edu/course/chapter/${chapter.id}/quiz`, `Chapter ${chapter.id} Quiz`, score);
            handleNext();
          }} onPrev={handlePrev} />}
        {activeStep === 3 && <StepInvestigate onNext={handleNext} onPrev={handlePrev} />}
        {activeStep === 4 && <StepBuildPackage savedData={submission} onSaveLocal={(data: any) => setSubmission({ ...submission, ...data })} onNext={(data: any) => { setSubmission({ ...submission, ...data }); handleNext(); }} onPrev={handlePrev} />}
        {activeStep === 5 && <StepPublish chapter={chapter} onComplete={handleMarkCompleted} onPrev={handlePrev} />}
      </div>
    </div>
  );
}

// --- INDIVIDUAL STEPS ---

function StepNav({ onPrev, onNext, nextText = "Next Step", nextDisabled = false, showNext = true }: any) {
  return (
    <div className="mt-8 pt-6 border-t border-rose-900/50 flex justify-between items-center">
      {onPrev ? (
        <button onClick={onPrev} className="text-rose-400 hover:text-white px-6 py-3 font-medium transition-colors border border-rose-900/50 rounded-lg hover:bg-rose-900/30">
          Previous Step
        </button>
      ) : <div></div>}
      
      {showNext && (
        <button disabled={nextDisabled} onClick={onNext} className="bg-rose-700 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg">
          {nextText}
        </button>
      )}
    </div>
  );
}

function StepAssignment({ onNext }: { onNext: () => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold mb-6 flex items-center"><Edit3 className="mr-3 text-rose-500" /> The Assignment Desk</h2>
      <div className="prose prose-invert prose-rose max-w-none">
        <p className="text-lg text-slate-200">
          Translate this chapter’s research into actionable intelligence. Build your "Front Page Package."
        </p>
        
        <div className="bg-[#1a0208] border border-rose-900/50 rounded-xl p-6 my-8">
          <h3 className="text-rose-400 font-bold mb-4 uppercase">Your Deliverables</h3>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start"><CheckSquare className="w-5 h-5 mr-3 text-rose-700 shrink-0 mt-0.5" /> <span><strong>Infographic:</strong> One main claim, max 3 supporting points.</span></li>
            <li className="flex items-start"><CheckSquare className="w-5 h-5 mr-3 text-rose-700 shrink-0 mt-0.5" /> <span><strong>Mini-article (150-220 words):</strong> "What OECD says", "Why it matters", and "Monday Morning Moves".</span></li>
            <li className="flex items-start"><CheckSquare className="w-5 h-5 mr-3 text-rose-700 shrink-0 mt-0.5" /> <span><strong>Evidence Anchor:</strong> Specific page citation.</span></li>
            <li className="flex items-start"><CheckSquare className="w-5 h-5 mr-3 text-rose-700 shrink-0 mt-0.5" /> <span><strong>Publication:</strong> Comment or post on LinkedIn.</span></li>
          </ul>
        </div>
      </div>
      <StepNav onNext={onNext} nextText="Accept Assignment & Continue" />
    </div>
  );
}

function StepLearn({ chapter, onNext, onPrev }: { chapter: Chapter, onNext: () => void, onPrev: () => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold mb-6 flex items-center"><BookOpen className="mr-3 text-rose-500" /> Research & Learn</h2>
      <p className="text-slate-300 mb-8">
        Choose your own way to consume the content below. Download the chapter to use in NotebookLM or view the official thread for summaries and media.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#0e2a47]/20 border border-[#1e4a77]/40 rounded-xl p-8 text-center shadow-inner">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0a66c2]/20 text-[#0a66c2] mb-4">
            <LinkIcon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">LinkedIn Hub</h3>
          <p className="text-sm text-slate-400 mb-6">Read the summary article and listen to the podcast.</p>
          <a href={chapter.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center bg-[#0a66c2] hover:bg-[#004182] text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Open Hub <ExternalLink className="w-5 h-5 ml-2" />
          </a>
        </div>

        <div className="bg-[#1a0208] border border-rose-900/50 rounded-xl p-8 text-center shadow-inner">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-900/30 text-rose-400 mb-4">
            <Download className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Chapter PDF</h3>
          <p className="text-sm text-slate-400 mb-6">Download the raw PDF to add to your NotebookLM.</p>
          {chapter.pdfUrl ? (
            <a href={chapter.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center bg-rose-900 hover:bg-rose-800 text-white border border-rose-500 px-6 py-3 rounded-lg font-medium transition-colors">
              Get Chapter PDF <ExternalLink className="w-5 h-5 ml-2" />
            </a>
          ) : (
             <button disabled className="inline-flex items-center bg-slate-800 text-slate-500 px-6 py-3 rounded-lg font-medium">
              No PDF Available
             </button>
          )}
        </div>
      </div>

      <StepNav onNext={onNext} onPrev={onPrev} nextText="I have reviewed the material" />
    </div>
  );
}

function StepQuiz({ savedScore, onPass, onPrev }: { savedScore: number | null, onPass: (s: number) => void, onPrev: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    let correct = 0;
    MOCK_QUIZ.forEach((q, i) => { if (answers[i] === q.a) correct++; });
    setScore((correct / MOCK_QUIZ.length) * 100);
    setSubmitted(true);
  };

  if (savedScore !== null && savedScore >= 80 && !submitted) {
    return (
      <div className="text-center py-12 animate-in fade-in">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Knowledge Check Passed</h2>
        <p className="text-slate-400 mb-8">You scored {savedScore}%.</p>
        <StepNav onNext={() => onPass(savedScore)} onPrev={onPrev} nextText="Continue to Investigation" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold mb-2">Knowledge Check</h2>
      <p className="text-slate-400 mb-8">Pass with 80% to proceed.</p>
      
      <div className="space-y-8">
        {MOCK_QUIZ.map((q, i) => (
          <div key={i} className="bg-[#1a0208] p-6 rounded-xl border border-rose-900/30">
            <p className="font-medium text-slate-200 mb-4">{i + 1}. {q.q}</p>
            <div className="space-y-2">
              {q.options.map((opt, oIdx) => {
                const isSelected = answers[i] === oIdx;
                let btnClass = `w-full text-left px-4 py-3 rounded-lg border transition-colors ${isSelected ? 'bg-rose-900/40 border-rose-500 text-white' : 'bg-transparent border-rose-900/30 text-slate-400 hover:border-rose-700'}`;
                if (submitted) {
                  const isCorrect = oIdx === q.a;
                  if (isCorrect) btnClass = "w-full text-left px-4 py-3 rounded-lg border bg-green-900/20 border-green-500 text-white";
                  else if (isSelected && !isCorrect) btnClass = "w-full text-left px-4 py-3 rounded-lg border bg-red-900/20 border-red-500 text-white";
                  else btnClass = "w-full text-left px-4 py-3 rounded-lg border bg-transparent border-rose-900/10 text-slate-600 opacity-50";
                }
                return (
                  <button key={oIdx} disabled={submitted} onClick={() => setAnswers({...answers, [i]: oIdx})} className={btnClass}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-rose-900/50 flex justify-between items-center">
        <button onClick={onPrev} className="text-rose-400 hover:text-white px-6 py-3 font-medium transition-colors border border-rose-900/50 rounded-lg hover:bg-rose-900/30">
          Previous Step
        </button>
        {submitted ? (
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold">Score: <span className={score >= 80 ? 'text-green-400' : 'text-rose-500'}>{score}%</span></span>
            {score >= 80 ? (
              <button onClick={() => onPass(score)} className="bg-rose-700 hover:bg-rose-600 text-white px-8 py-3 rounded-lg font-medium">Continue</button>
            ) : (
              <button onClick={() => { setSubmitted(false); setAnswers({}); }} className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium">Retry Quiz</button>
            )}
          </div>
        ) : (
          <button disabled={Object.keys(answers).length < 5} onClick={handleSubmit} className="bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-medium">
            Submit Answers
          </button>
        )}
      </div>
    </div>
  );
}

function StepInvestigate({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold mb-4 flex items-center"><Save className="mr-3 text-rose-500" /> AI Investigation Playground</h2>
      <p className="text-slate-300 mb-6 leading-relaxed">
        Upload the chapter document to your NotebookLM and ask questions directly in the interface to draft your mini-article.
      </p>

      <a href="https://notebooklm.google.com/" target="_blank" rel="noreferrer" className="inline-flex items-center bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium mb-8 transition-colors shadow-lg">
        Launch NotebookLM <ExternalLink className="w-5 h-5 ml-2" />
      </a>

      <div className="bg-[#1a0208] border border-rose-900/50 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-rose-300 mb-3">Suggested NotebookLM Prompts:</h3>
        <ul className="list-disc pl-5 space-y-3 text-slate-400">
          <li><strong>What OECD Says:</strong> "Summarize the core argument of this chapter in exactly 2 clear sentences."</li>
          <li><strong>Why it Matters:</strong> "Act as an expert. Explain why this specific concept matters for a teacher in my context."</li>
          <li><strong>Monday Morning Moves:</strong> "Generate 3 highly practical 'Monday Morning Moves' based on this chapter that I can implement immediately."</li>
          <li><strong>Inclusivity Check:</strong> "Review those 3 moves. How can I adapt them to ensure they are fully inclusive and accessible for all diverse learners?"</li>
        </ul>
      </div>

      <div className="p-4 bg-yellow-900/10 border border-yellow-700/30 rounded-lg flex gap-3 text-yellow-200/80 mb-8">
        <AlertCircle className="w-6 h-6 shrink-0" />
        <p>You must log your AI usage in the next step if you include AI-generated content in your package.</p>
      </div>

      <StepNav onNext={onNext} onPrev={onPrev} nextText="Investigation Complete" />
    </div>
  );
}

function StepBuildPackage({ savedData, onNext, onPrev, onSaveLocal }: { savedData: Partial<Submission> | undefined, onNext: (d: any) => void, onPrev: () => void, onSaveLocal: (d: any) => void }) {
  const [infographicUrl, setInfographicUrl] = useState(savedData?.infographicUrl || '');
  const [article, setArticle] = useState(savedData?.article || '');
  const [evidence, setEvidence] = useState(savedData?.evidence || '');
  const [reflections, setReflections] = useState<string[]>(savedData?.reflections || Array(REFLECTION_QUESTIONS.length).fill(''));
  const [usedAI, setUsedAI] = useState(savedData?.usedAI || false);
  const [aiLog, setAiLog] = useState<AILog>(savedData?.aiLog || {
    tool: '', goal: '', prompts: '', output: '', kept: '', changed: '', inclusive: '', inclusiveDetails: '', risksChecked: [], verification: ''
  });

  const wordCount = useMemo(() => {
    const txt = article.trim();
    return txt === '' ? 0 : txt.split(/\s+/).length;
  }, [article]);
  const isWordCountValid = wordCount >= 150 && wordCount <= 220;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setInfographicUrl(URL.createObjectURL(file));
  };

  const isFormValid = infographicUrl && evidence && isWordCountValid && reflections.every(r => r.trim() !== '') && 
    (!usedAI || (aiLog.tool && aiLog.prompts && aiLog.inclusive));

  const getCurrentData = () => ({ infographicUrl, article, evidence, reflections, usedAI, aiLog });

  const handleBack = () => { onSaveLocal(getCurrentData()); onPrev(); };
  const handleSave = () => { onNext(getCurrentData()); };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
      <section>
        <h3 className="text-lg font-bold text-white mb-2">1. Upload Infographic</h3>
        <p className="text-slate-400 mb-4">Required: One main claim, max 3 supporting points.</p>
        <div className="border-2 border-dashed border-rose-900/50 rounded-xl p-6 text-center bg-[#1a0208] relative hover:border-rose-500/50 transition-colors group">
          <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          {infographicUrl ? (
            <div className="flex flex-col items-center">
              <img src={infographicUrl} alt="Preview" className="h-32 object-contain mb-3 rounded shadow-lg" />
              <span className="text-green-400 flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Attached</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-400 group-hover:text-rose-300">
              <Upload className="w-8 h-8 mb-2" />
              <span className="font-medium">Click or drag image here</span>
              <span className="mt-1 text-sm">PNG, JPG</span>
            </div>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-white mb-2">2. Mini-Article (150-220 words)</h3>
        <div className="bg-[#1a0208] p-4 rounded-t-xl border-t border-x border-rose-900/50 flex justify-between items-center">
          <span className="text-slate-400 text-sm">Structure: What OECD says • Why it matters • Monday Morning Moves</span>
          <span className={`font-bold px-3 py-1 rounded text-sm ${isWordCountValid ? 'bg-green-900/30 text-green-400' : 'bg-rose-900/30 text-rose-400'}`}>
            {wordCount} words
          </span>
        </div>
        <textarea 
          value={article} onChange={e => setArticle(e.target.value)}
          className="w-full h-48 bg-[#1a0208] border border-rose-900/50 rounded-b-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-rose-500 resize-none"
          placeholder="Start writing..."
        />
      </section>

      <section>
        <h3 className="text-lg font-bold text-white mb-2">3. Evidence Anchor</h3>
        <input 
          type="text" value={evidence} onChange={e => setEvidence(e.target.value)}
          placeholder="e.g. Page 24, Figure 3.1..."
          className="w-full bg-[#1a0208] border border-rose-900/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500"
        />
      </section>

      <section>
        <h3 className="text-lg font-bold text-white mb-4">4. Reflections</h3>
        <div className="space-y-6">
          {REFLECTION_QUESTIONS.map((q, i) => (
            <div key={i}>
              <label className="block text-slate-300 mb-2">{q}</label>
              <textarea 
                value={reflections[i]} onChange={e => {
                  const newRef = [...reflections];
                  newRef[i] = e.target.value;
                  setReflections(newRef);
                }}
                className="w-full h-24 bg-[#1a0208] border border-rose-900/50 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-black/20 p-6 rounded-xl border border-rose-900/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">5. AI Use Log</h3>
          <label className="flex items-center cursor-pointer">
            <input type="checkbox" checked={usedAI} onChange={e => setUsedAI(e.target.checked)} className="mr-3 accent-rose-500 w-5 h-5" />
            <span className="font-medium">I used AI for this package</span>
          </label>
        </div>

        {usedAI && (
          <div className="space-y-6 animate-in fade-in mt-4 pt-6 border-t border-rose-900/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Tool Used</label>
                <input type="text" value={aiLog.tool} onChange={e => setAiLog({...aiLog, tool: e.target.value})} className="w-full bg-[#1a0208] border border-rose-900/50 rounded px-4 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Goal</label>
                <input type="text" value={aiLog.goal} onChange={e => setAiLog({...aiLog, goal: e.target.value})} className="w-full bg-[#1a0208] border border-rose-900/50 rounded px-4 py-2 text-white" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-2">Prompt(s) Used</label>
              <textarea value={aiLog.prompts} onChange={e => setAiLog({...aiLog, prompts: e.target.value})} className="w-full h-24 bg-[#1a0208] border border-rose-900/50 rounded px-4 py-3 text-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">What I Kept</label>
                <textarea value={aiLog.kept} onChange={e => setAiLog({...aiLog, kept: e.target.value})} className="w-full h-20 bg-[#1a0208] border border-rose-900/50 rounded px-4 py-3 text-slate-200" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">What I Changed & Why</label>
                <textarea value={aiLog.changed} onChange={e => setAiLog({...aiLog, changed: e.target.value})} className="w-full h-20 bg-[#1a0208] border border-rose-900/50 rounded px-4 py-3 text-slate-200" />
              </div>
            </div>

            <div className="bg-[#1a0208] p-6 rounded-xl border border-rose-900/50">
              <label className="block font-bold text-rose-300 mb-2">Inclusive Result?</label>
              <p className="text-sm text-slate-400 mb-4">Usable across diverse learners, avoids stereotypes, accounts for accessibility needs.</p>
              <div className="flex gap-6 mb-4">
                {['Yes', 'No', 'Unsure'].map(opt => (
                  <label key={opt} className="flex items-center cursor-pointer">
                    <input type="radio" name="inclusive" checked={aiLog.inclusive === opt} onChange={() => setAiLog({...aiLog, inclusive: opt as any})} className="mr-2 accent-rose-500 w-4 h-4" />
                    {opt}
                  </label>
                ))}
              </div>
              {(aiLog.inclusive === 'No' || aiLog.inclusive === 'Unsure') && (
                <input type="text" placeholder="What was missing/biased, and how did you adjust?" value={aiLog.inclusiveDetails} onChange={e => setAiLog({...aiLog, inclusiveDetails: e.target.value})} className="w-full bg-black/50 border border-rose-900/30 rounded px-4 py-3 text-white" />
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-3">Risks Checked</label>
              <div className="flex flex-wrap gap-4">
                {RISK_OPTIONS.map(risk => (
                  <label key={risk} className="flex items-center cursor-pointer bg-[#1a0208] px-4 py-2 rounded-lg border border-rose-900/30">
                    <input type="checkbox" checked={aiLog.risksChecked.includes(risk)} onChange={(e) => {
                      const newRisks = e.target.checked ? [...aiLog.risksChecked, risk] : aiLog.risksChecked.filter(r => r !== risk);
                      setAiLog({...aiLog, risksChecked: newRisks});
                    }} className="mr-3 accent-rose-500 w-4 h-4 rounded-sm" />
                    {risk}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Verification against text</label>
              <input type="text" value={aiLog.verification} onChange={e => setAiLog({...aiLog, verification: e.target.value})} className="w-full bg-[#1a0208] border border-rose-900/50 rounded px-4 py-3 text-white" />
            </div>

          </div>
        )}
      </section>

      <StepNav onNext={handleSave} onPrev={handleBack} nextText="Save & Proceed" nextDisabled={!isFormValid} />
    </div>
  );
}

function StepPublish({ chapter, onComplete, onPrev }: { chapter: Chapter, onComplete: (d: any) => void, onPrev: () => void }) {
  const [submissionType, setType] = useState<'comment'|'post'>('comment');
  const [url, setUrl] = useState('');
  const [likes, setLikes] = useState(0);

  const isUrlValid = url.includes('linkedin.com');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold mb-6 flex items-center"><LinkIcon className="mr-3 text-rose-500" /> Publish Your Package</h2>
      
      <div className="bg-[#1a0208] border border-rose-900/50 rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-white mb-4">Instructions</h3>
        <ol className="list-decimal pl-6 space-y-3 text-slate-300">
          <li>Take your Infographic and Mini-Article from the previous step.</li>
          <li>Go to the <a href={chapter.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center">Official Chapter Thread <ExternalLink className="w-4 h-4 ml-1"/></a>.</li>
          <li>Publish your package either as a <strong>Comment</strong> on that thread (recommended) or as your own <strong>Post</strong>.</li>
          <li>Copy the direct link to your comment/post and paste it below.</li>
        </ol>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block font-medium text-slate-300 mb-3">Submission Type</label>
          <div className="flex gap-4">
            <button onClick={() => setType('comment')} className={`px-6 py-3 rounded-lg border ${submissionType === 'comment' ? 'bg-rose-900/40 border-rose-500 text-white' : 'border-rose-900/30 text-slate-400 hover:border-rose-700'}`}>Comment on Thread</button>
            <button onClick={() => setType('post')} className={`px-6 py-3 rounded-lg border ${submissionType === 'post' ? 'bg-rose-900/40 border-rose-500 text-white' : 'border-rose-900/30 text-slate-400 hover:border-rose-700'}`}>My Own Post</button>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-300 mb-2">LinkedIn URL</label>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.linkedin.com/..." className="w-full bg-[#1a0208] border border-rose-900/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500" />
          {url && !isUrlValid && <p className="text-rose-500 mt-2">Please enter a valid LinkedIn URL.</p>}
        </div>

        <div>
          <label className="block font-medium text-slate-300 mb-2">Current Likes (Optional for tracking)</label>
          <input type="number" min="0" value={likes} onChange={e => setLikes(parseInt(e.target.value) || 0)} className="w-32 bg-[#1a0208] border border-rose-900/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500" />
        </div>
      </div>

      <StepNav onNext={() => onComplete({ submissionType, linkedinUrl: url, likes })} onPrev={onPrev} nextText="Submit Final Package" nextDisabled={!isUrlValid} />
    </div>
  );
}

// --- PORTFOLIO ---

function Portfolio({ submissions, setRoute, onExport, onImport }: any) {
  const allSubs = Object.values(submissions) as Submission[];
  const [importing, setImporting] = useState(false);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Your Portfolio</h2>
        <div className="flex items-center gap-3">
          <button onClick={onExport} className="bg-[#1a0208] border border-rose-900/50 hover:bg-rose-900/30 text-white px-6 py-2 rounded-lg transition-colors">
            Export JSON
          </button>

          <div className="relative">
            <input
              type="file"
              accept="application/json"
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              onClick={() => setImporting(true)}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  await onImport(f);
                } catch (err) {
                  console.error(err);
                  alert('Import failed. Make sure the JSON file is a valid OECD Explorer export.');
                } finally {
                  setImporting(false);
                  // allow re-importing the same file
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              className="bg-rose-900/20 border border-rose-700 hover:bg-rose-900/35 text-rose-200 px-6 py-2 rounded-lg transition-colors"
              disabled={importing}
            >
              {importing ? 'Importing…' : 'Import JSON'}
            </button>
          </div>
        </div>
      </div>

      {allSubs.length === 0 ? (
        <div className="bg-[#2a040e] border border-rose-900/30 rounded-xl p-12 text-center text-slate-400">
          No submissions yet. Go back to the Dashboard to start your first module.
        </div>
      ) : (
        <div className="space-y-6">
          {allSubs.map((sub, idx) => {
            const chap = CHAPTERS.find(c => c.id === sub.chapterId);
            return (
              <div key={idx} className="bg-[#2a040e] border border-rose-900/30 rounded-xl p-8 shadow-lg">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-bold text-xl text-rose-200">Module {sub.chapterId}: {chap?.title}</h3>
                  <span className="text-sm text-slate-500">{new Date(sub.completedAt).toLocaleDateString()}</span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    {sub.infographicUrl && (
                      <div className="mb-6">
                        <h4 className="text-sm uppercase tracking-wider text-slate-500 mb-3">Infographic</h4>
                        <img src={sub.infographicUrl} alt="Infographic" className="w-full rounded-xl border border-rose-900/50 object-cover shadow-md bg-[#1a0208]" />
                      </div>
                    )}
                    <h4 className="text-sm uppercase tracking-wider text-slate-500 mb-3">Mini-Article</h4>
                    <p className="text-slate-300 bg-[#1a0208] p-6 rounded-xl border border-rose-900/20 whitespace-pre-wrap leading-relaxed">
                      {sub.article}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-slate-500 mb-3">Links & Evidence</h4>
                    <div className="bg-[#1a0208] p-6 rounded-xl border border-rose-900/20 space-y-4">
                      <p><strong>Evidence Anchor:</strong> {sub.evidence}</p>
                      <p><strong>LinkedIn:</strong> <a href={sub.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center">View Post <ExternalLink className="w-4 h-4 ml-2"/></a></p>
                      <p><strong>Likes at submission:</strong> {sub.likes}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- CERTIFICATE ---

function Certificate({ user, totalCompleted, setRoute }: any) {
  if (totalCompleted < 14) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-white mb-4">Certificate Locked</h2>
        <p className="text-slate-400 text-lg">Complete all 14 modules to unlock your micro-credential.</p>
        <button onClick={() => setRoute('dashboard')} className="mt-8 text-rose-400 hover:text-rose-300 underline">Return to Dashboard</button>
      </div>
    );
  }

  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const certId = `OE-${user.name.substring(0,2).toUpperCase()}-${Date.now().toString().slice(-6)}`;

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-in fade-in">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Micro-credential</h2>
          <p className="text-slate-400">Download or share this verification.</p>
        </div>
        <button onClick={() => window.print()} className="bg-[#1a0208] border border-rose-900/50 hover:bg-rose-900/30 text-white px-6 py-2 rounded-lg transition-colors">
          Print / PDF
        </button>
      </div>

      <div className="bg-white text-slate-900 p-16 border-8 border-[#3a0311] rounded shadow-2xl relative overflow-hidden print:shadow-none print:border-4">
        <div className="absolute top-0 left-0 w-full h-32 bg-[#3a0311]/5"></div>
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 mx-auto bg-[#3a0311] rounded-full flex items-center justify-center mb-8">
            <Award className="w-12 h-12 text-rose-200" />
          </div>
          <h3 className="font-bold tracking-[0.2em] text-[#3a0311] uppercase mb-8">Certificate of Completion</h3>
          <p className="text-xl mb-4 text-slate-600">This certifies that</p>
          <h1 className="text-5xl font-serif font-bold text-[#3a0311] mb-8 border-b border-slate-300 pb-4 inline-block px-16">{user.name}</h1>
          <p className="text-xl text-slate-600 mb-10 max-w-xl mx-auto leading-relaxed">
            has successfully completed the 14-module professional development course, publishing original pedagogical insights for
          </p>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">The OECD Explorer</h2>
          <p className="text-slate-500 mb-16">March 2026 Edition</p>
          
          <div className="flex justify-between items-center border-t border-slate-200 pt-10 mt-12 px-8">
            <div className="text-left">
              <p className="font-bold text-lg">Total PD Hours: 14</p>
              <p className="text-slate-500">Date: {date}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">Verification ID: {certId}</p>
              <p className="text-slate-500">oecd2026.edu/verify/{certId}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-[#1a0208] p-8 rounded-xl border border-rose-900/50">
        <h4 className="font-bold text-rose-300 mb-3">LinkedIn Credit Snippet</h4>
        <p className="text-slate-400 mb-4">Paste this at the bottom of your final LinkedIn comment to claim credit:</p>
        <div className="bg-black/50 p-4 rounded-lg font-mono text-slate-300 break-all select-all">
          [PD Micro-credential Earned: The OECD Explorer. 14hrs. ID: {certId}]
        </div>
      </div>
    </div>
  );
}

// --- ADMIN / NEWSLETTER ---

function AdminNewsletter({ submissions, setRoute }: any) {
  const allSubs = Object.values(submissions) as Submission[];
  
  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Newsletter Builder (Admin)</h2>
          <p className="text-slate-400">Review submissions to select featured contributors for the 16-page issue.</p>
        </div>
        <button onClick={() => setRoute('dashboard')} className="text-rose-400 hover:text-rose-300">
          Exit Admin
        </button>
      </div>

      <div className="bg-[#2a040e] border border-rose-900/50 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left text-slate-300">
          <thead className="bg-[#1a0208] text-sm uppercase text-slate-400">
            <tr>
              <th className="px-8 py-5">Module</th>
              <th className="px-8 py-5">Type</th>
              <th className="px-8 py-5">Likes</th>
              <th className="px-8 py-5">Word Count</th>
              <th className="px-8 py-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-900/30">
            {allSubs.map((sub, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="px-8 py-5 font-medium text-white">Mod {sub.chapterId}</td>
                <td className="px-8 py-5 uppercase">{sub.submissionType}</td>
                <td className="px-8 py-5 text-rose-300 font-bold">{sub.likes}</td>
                <td className="px-8 py-5">{sub.article.split(/\s+/).length}</td>
                <td className="px-8 py-5">
                  <button className="border border-rose-700 bg-rose-900/20 text-rose-300 px-4 py-2 rounded-lg hover:bg-rose-900/40 transition-colors">
                    Feature
                  </button>
                </td>
              </tr>
            ))}
            {allSubs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-10 text-center text-slate-500">No submissions to review yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- SETTINGS (xAPI) ---

function SettingsPage({ config, setConfig, setRoute }: any) {
  const [localConfig, setLocalConfig] = useState<xAPIConfig>(config);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setConfig(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
      <button onClick={() => setRoute('dashboard')} className="text-rose-400 hover:text-rose-300 flex items-center mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5 mr-1" /> Back
      </button>

      <h2 className="text-2xl font-bold text-white mb-2">Settings & Integrations</h2>
      <p className="text-slate-400 mb-8">Configure your Learning Record Store (LRS) for xAPI telemetry.</p>

      <div className="bg-[#2a040e] border border-rose-900/50 rounded-xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-8 border-b border-rose-900/50 pb-6">
          <div>
            <h3 className="text-lg font-bold text-white">xAPI Enabled</h3>
            <p className="text-slate-500">Toggle telemetry statements on/off</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={localConfig.enabled} onChange={e => setLocalConfig({...localConfig, enabled: e.target.checked})} />
            <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
        </div>

        <div className={`space-y-6 ${!localConfig.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div>
            <label className="block font-medium text-slate-300 mb-2">LRS Endpoint</label>
            <input 
              type="url" placeholder="https://lrs.example.com/xapi"
              value={localConfig.endpoint} onChange={e => setLocalConfig({...localConfig, endpoint: e.target.value})}
              className="w-full bg-[#1a0208] border border-rose-900/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-slate-300 mb-2">Key / Username</label>
              <input 
                type="text"
                value={localConfig.key} onChange={e => setLocalConfig({...localConfig, key: e.target.value})}
                className="w-full bg-[#1a0208] border border-rose-900/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-300 mb-2">Secret / Password</label>
              <input 
                type="password"
                value={localConfig.secret} onChange={e => setLocalConfig({...localConfig, secret: e.target.value})}
                className="w-full bg-[#1a0208] border border-rose-900/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
          <p className="text-slate-500 mt-2">
            If enabled but left blank, statements are simulated in the browser console.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-rose-900/50 flex items-center justify-between">
          <span className="text-green-400 font-medium">{saved ? 'Settings saved!' : ''}</span>
          <button onClick={handleSave} className="bg-rose-700 hover:bg-rose-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
