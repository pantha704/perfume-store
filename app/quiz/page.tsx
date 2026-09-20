import Link from "next/link";
import { getProducts } from "@/lib/catalogue";
import { scoreQuiz } from "@/lib/quiz";
import { ProductCard } from "@/components/product/ProductCard";

const questions=[
  {name:"family",label:"Which atmosphere pulls you in?",options:[["Woody","Dry woods"],["Floral","Petals + spice"],["Smoky","Smoke + resin"],["Fresh","Mineral + citrus"],["Gourmand","Warm + edible"],["Amber","Amber + skin"]]},
  {name:"intensity",label:"How much presence?",options:[["intimate","Keep it close"],["close","Within arm’s reach"],["noticeable","Noticeable in a room"],["room-filling","Make an entrance"]]},
  {name:"season",label:"Where will you wear it most?",options:[["summer","Heat"],["monsoon","Monsoon"],["autumn","Cool evenings"],["winter","Winter"]]},
  {name:"occasion",label:"What should it survive?",options:[["office","Work + commute"],["everyday","Everyday"],["dinner","Dinner / date"],["events","Events + late nights"]]},
  {name:"mood",label:"What texture sounds right?",options:[["clean","Clean / airy"],["dry","Dry / tailored"],["soft","Soft / fabric-like"],["dark","Dark / resinous"]]},
  {name:"avoid",label:"What would you rather avoid?",options:[["sweet","Too sweet"],["smoky","Too smoky"],["floral","Too floral"],["fresh","Too fresh"]]},
] as const;

export default async function QuizPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const search=await searchParams;const complete=questions.every(q=>typeof search[q.name]==="string");const products=(await getProducts()).filter(p=>!p.isDiscoverySet);const results=complete?scoreQuiz(products,{family:String(search.family),intensity:String(search.intensity),season:String(search.season),occasion:String(search.occasion),mood:String(search.mood),avoid:String(search.avoid)}).slice(0,3):[];return <div className="quiz-page section-shell"><header data-reveal="up"><p className="kicker">Six questions · no account</p><h1>Find the air<br/><em>around you.</em></h1><p>Not an algorithm pretending to smell. A transparent filter across family, presence, weather and texture. Your answers stay in the URL so the core path works without JavaScript.</p></header>{complete?<><div className="quiz-result-intro" data-reveal="up"><span>Your edit</span><h2>Start with these three.</h2><Link href="/quiz">Retake the six questions</Link></div><div className="shop-grid compact-grid">{results.map((r,i)=><div key={r.product.id} className="quiz-result-card" data-reveal="up" data-reveal-delay={String(i*0.07)}><p>{r.reason}</p><ProductCard product={r.product} index={i}/></div>)}</div></>:<form className="quiz-form" method="get">{questions.map((q,i)=><fieldset key={q.name}><legend><span>0{i+1}</span>{q.label}</legend><div>{q.options.map(([value,label])=><label key={value}><input type="radio" name={q.name} value={value} required/><span>{label}</span></label>)}</div></fieldset>)}<button className="button dark-button" type="submit">Build my edit →</button></form>}</div>}
