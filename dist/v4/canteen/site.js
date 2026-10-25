import {start,esc} from '../shared/runtime.js';
import {FACTS,normalize} from '../shared/registry.js';
const app=document.querySelector('#app'),params=new URLSearchParams(location.search),view=params.get('view')||'card';
const rows=[['C0313-246','2025-03-13 18:06:12','晚餐一窗','HM03','12.00','本人消费'],['C0313-271','2025-03-13 20:41:08','夜宵二窗',FACTS.terminal,'18.00','临时共享回执'],['C0314-012','2025-03-14 06:32:41','早餐一窗','HM03','4.00','本人消费']];
function card(){return `<p class="gov-note">本页支持经本人授权的回执补打。杰哥已开放卡尾号0327在03月13日的只读回执，其余交易仍需本人到窗口查询。仅开放指定日期的交易明细。</p><form class="gov-form" data-query><label>学号 / 共享卡尾号<input name="student" placeholder="四位卡尾号" maxlength="8" autocomplete="off" required></label><label>交易日期<input name="date" type="date" value="2025-03-13" min="2025-03-01" max="2025-03-31" required></label><button>查询回执</button><p>终端屏显可能存在误差，导出时间为服务器入账时间，不再重复扣除偏差。</p></form><p data-query-message class="gov-message" role="status"></p><div id="results"><div class="gov-empty">请选择日期并输入授权卡尾号。</div></div>`;}
function showRows(){return `<div class="gov-table-tools"><span>授权范围：0327 / 2025-03-13　查询到1条记录</span><button data-export>导出 CSV</button></div><div class="gov-table-wrap"><table><thead><tr>${['流水号','服务器时间','窗口','机号','金额（元）','状态'].map(t=>`<th>${t}</th>`).join('')}</tr></thead><tbody><tr data-snapshot="3月13日20:41:08，卡尾号0327；夜宵二窗；QH-HM01；18元。回执含车仔面两份、清汤一份、饭团一个。服务器入账时间；无传播来源信息。">${rows[1].map((x,i)=>`<td data-collect="receipt" tabindex="0" role="button" aria-label="查看交易回执">${esc(x)}</td>`).join('')}</tr></tbody></table></div><section class="gov-receipt" data-read="receipt"><strong>青禾食堂 / 夜宵回执</strong>流水 C0313-271　卡尾号 0327
${FACTS.meal} 20:41:08（服务器）
--------------------------------
车仔面　　　　　　2 × 6.00
清汤　　　　　　　1 × 3.00
饭团　　　　　　　1 × 3.00
合计　　　　　　　　18.00
--------------------------------
补打日期：2025-03-31
请凭流水号到原窗口核对。
补打副本不作为报销凭证。
</section><p class="gov-note">发现扣费问题请凭流水号到窗口核对。学生卡挂失请到总务一楼办理。</p>`;}
const bodies={card:card(),menu:`<ul class="gov-publication"><li><time>2025-03-31</time>第六周菜谱公示<small>早餐：粥、面点；午餐：两荤两素轮换；夜宵：车仔面、清汤、饭团。供应以当日窗口为准。</small></li><li><time>2025-03-24</time>夜宵品种及结算说明<small>窗口出售车仔面；学生自带调料不计入采购清单。按份结算不记录就餐人员名单。</small></li><li><time>2025-03-17</time>餐具耗材供货验收说明（归档）<small>供应方报表与校内签收分开留底，具体批次需到总务处办理查阅。</small></li></ul>`,maintenance:`<ul class="gov-publication"><li><time>2025-03-14</time><details><summary>餐具区支路检修完成通知 / WX0313-04</summary><p>03月13日晚 XD02 支路检修，恢复后另行办理试机与签认。维保资料由经手人按业务范围申请查阅。</p><small>登记：总务值班室　状态：已归档</small></details></li><li><time>2025-03-03</time>后门终端屏显校准安排<small>机号${FACTS.terminal}，显示模块与入账服务器分别校时。消费明细请以导出字段说明为准。</small></li></ul>`,contact:`<p>扣费和设备问题：工作日携校园卡到总务办公室二楼，提供流水号或设备编号。</p><p>涉及个人就诊记录，请先联系医务室；公共意见箱不收实名病历附件。</p><p>历史业务材料的查阅按授权范围登记，复印件需注明出具单位和页码。</p><p class="gov-note">当前为校内只读公示端，不接收在线个人信息。请通过办公室现场提交。</p>`};
const titles={card:'一卡通消费明细',menu:'每周菜谱与采购公示',maintenance:'餐具维保公开栏',contact:'投诉建议箱'};const active=Object.hasOwn(bodies,view)?view:'card';app.innerHTML=`<p class="gov-breadcrumb">服务大厅 / ${titles[active]}</p><section class="gov-section"><h2>${titles[active]}</h2><div class="gov-body">${bodies[active]}</div></section>`;document.querySelector(`[data-nav="${active}"]`)?.classList.add('active');
const {bindReading}=await start('canteen');app.addEventListener('submit',e=>{if(!e.target.matches('[data-query]'))return;e.preventDefault();const f=e.target,id=normalize(f.elements.student.value);if(!['0327','20220327'].includes(id)||f.elements.date.value!==FACTS.meal){document.querySelector('[data-query-message]').textContent='该日期或卡号不在本次只读授权范围。请核对原帖的回执信息。';return;}document.querySelector('[data-query-message]').textContent='查询完成。';document.querySelector('#results').innerHTML=showRows();bindReading(app);});
app.addEventListener('click',e=>{if(e.target.matches('[data-export]')){const data='\ufeff流水号,服务器时间,窗口,机号,金额,状态\r\n'+rows[1].join(',');const u=URL.createObjectURL(new Blob([data],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='0327-0313回执.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}if(e.target.matches('td[data-collect]'))e.target.closest('tr').classList.toggle('selected');});

app.addEventListener('keydown',e=>{if(e.target.matches('td[data-collect]')&&['Enter',' '].includes(e.key)){e.preventDefault();e.target.click();}});
