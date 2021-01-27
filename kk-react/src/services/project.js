import request from '../utils/request';

/**
 * @desc 获取项目列表
 * @author zhangxueqing01
 * @method POST
 * @param {Object} params
 */
export async function queryProjectList(params) {
  return request('/ep/rest/project/list', { data: { ...params } });
}

// 根据项目idlist查询项目详情信息
export async function queryProjectListDetail(params) {
  return request('/ep/rest/project/listDetail', { data: { ...params } });
}

/**
 * @desc 获取项目列表(拆分为下面五个接口，这个接口即将废弃)
 * @method GET
 * @param {Number} id 项目id
 */
export async function queryProject(id) {
  return request(`/ep/rest/project/home/${id}`);
}

/**
 * @desc 获取项目详情（基本信息）
 */
export async function getProjectBasic(id) {
  return request(`/ep/rest/project/home/basic/${id}`);
}

/**
 * @desc 获取项目详情（动态）
 */
export async function getProjectEvent(params) {
  return request(`/ep/rest/project/event`, { data: params });
}

/**
 * @desc 获取项目详情（成员）
 */
export async function getProjectMember(id) {
  return request(`/ep/rest/project/home/member/${id}`);
}

/**
 * @desc 获取项目详情（目标）
 */
export async function getProjectObjective(id) {
  return request(`/ep/rest/project/objective/home/${id}`);
}

/**
 * @desc 获取项目详情（规划内容+里程碑）
 */
export async function getProjectPlanning(id) {
  return request(`/ep/rest/project/home/planning/${id}`);
}

/**
 * @desc 查询用户
 * @method GET
 * @param {Object} params
 */
export async function queryUser(params) {
  return request(`/rest/user/search`, { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 查询当前用户
 * @method GET
 */
export async function getCurrentUserInfo(params) {
  return request('/rest/getCurrentUserInfo', { data: { ...params } });
}

/**
 * @desc 获取自定义模版列表
 * @method GET
 * @param {Number} id 产品id
 */
export async function queryTemplateList(id) {
  return request(`/rest/project/template/listByProductid?productid=${id}`);
}

/**
 * @desc 获取自定义模版列表
 * @method GET
 * @param {Number} id 产品id
 */
export async function queryTemplateItems(templateid, type) {
  return request(`/rest/project/template/tcrelation/listByTemplateidAndType?templateid=${templateid}&type=${type}`);
}

/**
 * @desc 字段类型为下拉框时获取下拉值
 * @method GET
 * @param {Number} customfieldid 模版id
 */
export async function queryTemplateSelect(customfieldid) {
  return request(`/rest/project/template/customfield/value/listByCustomFieldid?customfieldid=${customfieldid}`);
}

/**
 * @desc 保存目标
 * @method POST
 * @param {Number} customfieldid 模版id
 */
export async function saveAim(params) {
  return request('/ep/rest/jira/issue/save', { data: { ...params }, method: 'POST' });
}

/**
 * @desc  根据issueKey获取目标信息
 * @method GET
 * @param {String} issueKey jiraKey
 */
export async function getAimMsg(issueKey) {
  return request(`/ep/rest/jira/issue/${issueKey}`);
}

/**
 * @desc  更新目标
 * @method POST
 * @param {Object} params
 */
export async function updateAim(params) {
  return request('/ep/rest/jira/issue/update', { data: { ...params }, method: 'POST' });
}

/**
 * @desc jira单据是否有子任务
 * @method GET
 * @param {String} issueKey jiraKey
 */
export async function hasSubtask(issueKey) {
  return request(`/ep/rest/jira/issue/${issueKey}/hasSubtasks`);
}

/**
 * @desc  删除目标
 * @method POST
 * @param {Object} params
 */
export async function deleteAim(params) {
  return request('/ep/rest/jira/issue/delete', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 保存项目
 * @method POST
 * @param {Object} params
 */
export async function saveProject(params) {
  return request('/ep/rest/project/create', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 编辑保存项目
 * @method POST
 * @param {Object} params
 */
export async function updateProject(params) {
  return request('/ep/rest/project/update', { data: { ...params }, method: 'POST' });
}

/**
 * 管理成员
 */

/**
 * @desc 获取成员列表
 * @method GET
 * @param {Object} params
 */
export async function getMemberRoleList(params) {
  return request('/rest/product/role/listByProductId', { data: { ...params } });
}

/**
 * @desc 获取成员列表
 * @method POST
 * @param {Object} params
 */
export async function getMemberList(params) {
  return request('/ep/rest/project/member/list', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 保存成员列表
 * @method POST
 * @param {Object} params
 */
export async function saveMember(params) {
  return request('/ep/rest/project/member/save', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 更新成员列表
 * @method POST
 * @param {Object} params
 */
export async function updateMember(params) {
  return request('/ep/rest/project/member/update/role', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 批量导入成员
 * @method POST
 * @param {Object} formData
 */
export async function importMember(formData) {
  return request('/ep/rest/project/member/import', { data: formData, method: 'POST', type: 'upload' });
}

/**
 * @desc 删除成员
 * @method DELETE
 * @param {Number} id
 */
export async function deleteMember(id) {
  return request(`/ep/rest/project/member/${id}`, { method: 'DELETE' });
}

/**
 * @desc 获取产品列表(所有的--暂不用)
 * @method GET
 */
export async function queryProduct() {
  return request(`/rest/product/listAll`);
}

/**
 * @desc 获取jira单据
 * @method POST
 * @param {Object} params
 */
export async function queryJiraList(params) {
  return request(`/ep/rest/jira/issue/list`, { data: { ...params }, method: 'POST' });
}

/**
 * @desc 获取ep单据
 * @method GET
 * @param {Object} params
 */
export async function queryEpList(params) {
  return request(`/ep/rest/project/planning/issue/list`, { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 获取筛选类型和状态数据,一个参数products，在创建项目时规划里程碑调用
 * @method POST
 * @param {Array} arr
 */
export async function queryEditContents(arr) {
  return request(`/ep/rest/project/planning/edit`, { data: { products: arr }, method: 'POST' });
}

/**
 * @desc 发起立项
 * @method POST
 * @param {Object} params
 */
export async function beginProject(params) {
  return request(`/ep/rest/project/initiation/apply`, { data: { ...params }, method: 'POST' });
}

/**
 * @desc 立项审批操作通过or不通过or撤回
 * @method POST
 * @param {Object} params
 */
export async function beginAuditProject(params) {
  return request(`/ep/rest/project/initiation/audit`, { data: { ...params }, method: 'POST' });
}

/**
 * @desc 立项审批页面
 * @method GET
 * @param {Number} id
 */
export async function beginProjectContents(params) {
  return request(`/ep/rest/project/initiation/audit`, { data: { ...params } });
}

/**
 * @desc 发起结项
 * @method POST
 * @param {Object} params
 */
export async function finishProject(params) {
  return request(`/ep/rest/project/closure/apply`, { data: { ...params }, method: 'POST' });
}

/**
 * @desc 结项审批操作通过or不通过or撤回
 * @method POST
 * @param {Object} params
 */
export async function finishAuditProject(params) {
  return request(`/ep/rest/project/closure/audit`, { data: { ...params }, method: 'POST' });
}

/**
 * @desc 结项审批页面
 * @method GET
 * @param {Number} id
 */
export async function finishProjectContents(params) {
  return request(`/ep/rest/project/closure/audit`, { data: { ...params } });
}

/**
 * @desc 编辑项目
 * @method GET
 * @param {Number} id
 */
export async function getEditProject(id) {
  return request(`/ep/rest/project/get/${id}`);
}

/**
 * @desc 获取当前里程碑
 * @method GET
 * @param {Number} id
 */
export async function editMileStone(id) {
  return request(`/ep/rest/project/milestone/edit/${id}`);
}

/**
 * @desc 保存里程碑
 * @method POST
 * @param {Object} params
 */
export async function saveMileStone(params) {
  return request('/ep/rest/project/milestone/save', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 删除里程碑
 * @method DELETE
 * @param {Number} id
 */
export async function deleteMileStone(id) {
  return request(`/ep/rest/project/milestone/${id}`, { method: 'DELETE' });
}

/**
 * @desc 获取当前里程碑关联的单据
 * @method GET
 * @param {Object} params
 */
export async function mileStoneRelate(params) {
  return request(`/ep/rest/project/milestone/relate`, { data: { ...params } });
}

/**
 * @desc 已有项目获取规划内容,和queryEditContents同一个接口，两个参数projectId,products
 * @method POST
 * @param {Object} params
 */
export async function getPlanning(params) {
  return request('/ep/rest/project/planning/edit', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 已有项目更新规划内容
 * @method POST
 * @param {Object} params
 */
export async function updatePlanning(params) {
  return request('/ep/rest/project/planning/save', { data: { ...params }, method: 'POST' });
}

/**
 * @desc 关闭项目
 * @method POST
 * @param {Number} id
 */
export async function closeProject(id) {
  return request(`/ep/rest/project/cancel/${id}`, { method: 'POST' });
}

/**
 * @desc 查询项目负责人列表
 * @method GET
 */
export async function projectOwnerList() {
  return request('/ep/rest/project/owner/list');
}

/**
 * @desc 查询项目创建人列表
 * @method GET
 */
export async function projectCreatorList() {
  return request('/ep/rest/project/creator/list');
}

/**
 * @desc 查询部门列表
 * @method GET
 */
export async function getProjectDepartMents(params) {
  return request('/ep/rest/project/departments', { data: { ...params }, type: 'urlencoded' });
}

/**
 * @desc 查询当前成员角色
 * @method GET
 * @param {Number} id
 */
export async function getCurrentMemberInfo(id) {
  return request(`/ep/rest/project/getCurrentMemberInfo?projectId=${id}`);
}

/**
 * @desc 查询立项时初审和复审人列表
 * @method GET
 * @param {Number} productid
 * @param {String} type
 */
export async function getBeginAuditUser(productid, type) {
  return request(`/rest/product/checkuser/listByProductidAndType?productid=${productid}&type=${type}`);
}

/**
 * @desc 判断是否有操作权限
 * @method GET
 * @param {Object} params
 */
export async function getOperationPerm(params) {
  return request(`/ep/rest/project/operation/perm`, { data: { ...params } });
}

/**
 * @desc 发起变更申请
 * @method POST
 */
export async function beginChangeApply(params) {
  return request(`/ep/rest/project/change/apply`, { data: { ...params }, method: 'POST' });
}

/**
 * @desc 变更审批页
 * @method POST
 */
export async function beginChangeAuditContents(params) {
  return request(`/ep/rest/project/change/audit`, { data: { ...params } });
}

/**
 * @desc 获取指定项目的变更版本列表
 * @method GET
 */
export async function getProjectChangeVersion(id) {
  return request(`/ep/rest/project/change/version/list/${id}`);
}

/**
* @desc 变更审批操作通过or不通过or撤回
* @method POST
* @param {Object} params
*/
export async function changeAuditProject(params) {
  return request(`/ep/rest/project/change/audit`, { data: { ...params }, method: 'POST' });
}

/**
* @desc 获取指定变更版本的信息
* @method POST
* @param {Object} params
*/
export async function getChangeVersionInfo(id) {
  return request(`/ep/rest/project/change/version/${id}`);
}

/**
* @desc 发起目标验收查询接口
* @method POST
* @param {Object} params
*/
export async function getInitiateQuery(params) {
  return request(`/rest/project/objective/initiate/query`, { data: { ...params } });
}

/**
* @desc 项目验收审批前的查询项目目标详细数据
* @method POST
* @param {Object} params
*/
export async function getInitiateDetail(params) {
  return request(`/rest/project/objective/initiate/detail`, { data: { ...params } });
}

/**
* @desc 项目目标验收发起确认
* @method POST
* @param {Object} params
*/
export async function saveAimSubmit(params) {
  return request(`/rest/project/objective/initiate/submit`, { data: { ...params }, method: 'POST' });
}

/**
* @desc 项目目标验收发起确认
* @method POST
* @param {Object} params
*/
export async function saveAimApproval(params) {
  return request(`/rest/project/objective/initiate/review`, { data: { ...params }, method: 'POST' });
}


/**
* @desc 目标验收撤回
* @method POST
* @param {Object} params
*/
export async function withdrawAim(params) {
  return request(`/rest/project/objective/initiate/withdraw`, { data: { ...params }, method: 'POST' });
}

// 获取权限组下所有的用户列表
export async function getRoleGroup(params) {
  return request(`/ep/rest/project/member/list/byRoleGroup`, { data: { ...params } });
}

// 新增权限组别用户
export async function addRoleGroup(params) {
  return request(`/ep/rest/project/member/roleGroup/add`, { data: { ...params }, method: 'POST' });
}

// 删除用户权限组别
export async function deleteRoleGroup(params) {
  return request(`/ep/rest/project/member/roleGroup/delete`, { data: { ...params }, method: 'POST' });
}

// 项目权限管理初始化使用的（暂不用了）
export async function memberInit() {
  return request(`/ep/rest/project/member/list/init`);
}

// 发起立项申请前查询审批流节点数据EP
export async function getInitiateFlowEP(projectId) {
  return request(`/ep/rest/workflow/apply/initiate/${projectId}`);
}

// 发起立项审批提交EP
export async function submitInitiateFlowEP(params) {
  return request(`/ep/rest/workflow/apply/initiate`, { data: { ...params }, method: 'POST' });
}

/**
 * @desc 立项审批流应用审核EP
 */
export async function beginAuditProjectWorkFlowEP(params) {
  return request(`/ep/rest/workflow/apply/initiate/audit`, { data: { ...params }, method: 'POST' });
}

/**
 * @desc 变更审批查询人员EP
 */
export async function getChangeFlowEP(projectId) {
  return request(`/ep/rest/workflow/apply/change/${projectId}`);
}

/**
 * @desc 发起变更审批EP
 */
export async function submitChangeFlowEP(params) {
  return request(`/ep/rest/workflow/apply/change`, { data: { ...params }, method: 'POST' });
}

/**
 * @desc 变更审批通过or不通过or退回
 */
export async function changeAuditProjectEP(params) {
  return request(`/ep/rest/workflow/apply/change/audit`, { data: { ...params }, method: 'POST' });
}

// 项目目标取消
export async function aimCancel(params) {
  return request(`/ep/rest/project/objective/cancel`, { data: { ...params }, method: 'POST' });
}

// 项目目标重新打开
export async function aimReopen(params) {
  return request(`/ep/rest/project/objective/updateReopen?objectiveId=${params.objectiveId}`, { method: 'PUT' });
}

// 项目下解绑目标
export async function aimUnbindFromProject(params) {
  return request(`/ep/rest/project/objective/unBind`, { data: { ...params }, method: 'POST' });
}

// 项目目标删除（从ep和jira都删除）
export async function aimDeleteFromProject(params) {
  return request(`/ep/rest/project/objective/delete`, { data: { ...params }, method: 'POST' });
}

// 项目详情创建目标
export async function aimCreateFromProject(params) {
  return request(`/ep/rest/project/objective/add`, { data: { ...params }, method: 'POST' });
}

// 项目详情添加已有目标
export async function addProjectObjective(params) {
  return request('/ep/rest/project/objective/bind', { data: { ...params }, method: 'POST' });
}

// 获取目标自定义字段EP
export async function getObjectiveCustomEP(params) {
  return request(`/rest/product/customfield/listByProductidOfObjective`, { data: { ...params }, method: 'GET' });
}

// 创建目标EP
export async function addObjectiveEP(params) {
  return request(`/rest/objective/add`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 查询目标EP
export async function getAimBySearchEP(params) {
  return request(`/rest/objective/search`, { data: { ...params }, type: 'urlencoded' });
}

// 获取目标详情EP
// export async function getObjectiveDetailEP(params) {
//   return request(`/rest/objective/get`, { data: { ...params }, type: 'urlencoded' });
// }

// 项目下获取目标详情（为了项目下目标权限单据的接口）
export async function getObjectiveDetailEP(params) {
  return request(`/ep/rest/project/objective`, { data: { ...params } });
}

// 获取临时目标详情
export async function getObjectiveDetailEPTemp(params) {
  return request(`/ep/rest/project/objective/temp`, { data: { ...params } });
}

// 更新目标EP
export async function updateObjectiveEP(params) {
  return request(`/ep/rest/project/objective/update`, { data: { ...params }, method: 'PUT' });
}

// 更新临时目标EP
export async function updateTempObjectiveEP(params) {
  return request(`/ep/rest/project/objective/update4Temp`, { data: { ...params }, method: 'PUT' });
}

// 获取列表型自定义字段的值列表EP
export async function queryTemplateSelectEP(params) {
  return request(`/rest/product/customfield/value/listByCustomFieldid`, { data: { ...params }, type: 'urlencoded' });
}

// 获取JIRA不同问题类型的字段配置信息
export async function getJiraSetting(params) {
  return request(`/rest/jira/createMeta`, { data: { ...params }, type: 'urlencoded' });
}

// 创建JIRA上的问题
export async function saveJiraIssue(params) {
  return request(`/rest/jira/createIssue`, { data: { ...params }, method: 'POST' });
}

// 获取规划内容的条件可选值（类型+状态）
export async function getIssueCondition(params) {
  return request(`/ep/rest/jira/issue/getCondition`, { data: { ...params }, method: 'POST' });
}

/**
 * @desc 结项审批查询人员EP
 */
export async function getFinishFlowEP(projectId) {
  return request(`/ep/rest/workflow/apply/closure/${projectId}`);
}

/**
 * @desc 发起结项审批EP
 */
export async function submitFinishFlowEP(params) {
  return request(`/ep/rest/workflow/apply/closure`, { data: { ...params }, method: 'POST' });
}

/**
 * @desc 结项审批通过or不通过or退回
 */
export async function finishAuditProjectEP(params) {
  return request(`/ep/rest/workflow/apply/closure/audit`, { data: { ...params }, method: 'POST' });
}

// 添加JIRA单的备注内容
export async function addJiraComment(params) {
  return request(`/rest/jira/addComment`, { data: { ...params }, method: 'POST', type: 'urlencoded' });
}

// 项目规划单据添加为里程碑
export async function issueAddMilestoneWBS(params) {
  return request(`/ep/rest/project/planning/addMilestone`, { data: { ...params }, method: 'POST' });
}

// 项目规划单据解除里程碑关联关系
export async function issueDeleteMilestoneWBS(params) {
  return request(`/ep/rest/project/planning/deleteMilestone`, { data: { ...params }, method: 'POST' });
}

// wbs创建单据并绑定父单据
export async function createIssueWBS(params) {
  return request(`/ep/rest/issue/create4WbsIssue`, { data: { ...params }, method: 'POST' });
}

// 项目创建独立单据
export async function createIssueAloneWBS(params) {
  return request(`/ep/rest/issue/create4Wbs`, { data: { ...params }, method: 'POST' });
}

// 项目规划单据绑定到目标
export async function issueBindAimWBS(params) {
  return request(`/ep/rest/project/planning/bindIssue`, { data: { ...params }, method: 'POST' });
}

// 项目规划单据解除绑定到项目
export async function issueunBindProjectWBS(params) {
  return request(`/ep/rest/project/planning/unbindIssue`, { data: { ...params }, method: 'POST' });
}

// 项目规划单据删除单据
export async function issuDeleteProjectWBS(params) {
  return request(`/ep/rest/project/planning/deleteIssue`, { data: { ...params }, method: 'POST' });
}

// 获取项目的子产品下自定义字段关联的级联字段列表
export async function getCascadeList(params) {
  return request(`/rest/cascade/field/listByProductidAndType`, { data: { ...params } });
}

// 获取绑定字段不同值的级联配置
export async function getCategoryList(params) {
  return request(`/rest/cascade/category/list`, { data: { ...params } });
}

// 获取项目下的所有子产品列表
export async function projectBelongSubProductList() {
  return request(`/ep/rest/project/subProduct/list`);
}

// 获取项目下的所有子产品列表
export async function getAimCompleteStatus(params) {
  return request(`/rest/project/objective/initiate/issueCompleteState`, { data: { ...params } });
}

// 新增收藏项目
export async function addCollectProject(params) {
  return request('/ep/rest/project/collect/add', { data: { ...params }, method: 'POST' });
}

// 取消收藏项目
export async function cancelCollectProject(params) {
  return request('/ep/rest/project/collect/cancel', { data: { ...params }, method: 'POST' });
}

// 生成项目代号
export async function createProjectCode() {
  return request('/ep/rest/project/createProjectCode', { method: 'POST' });
}

// 编辑项目描述
export async function updateProjectDescription(params) {
  return request('/ep/rest/project/updateDescription', { data: { ...params }, method: 'PUT' });
}

// 编辑项目标题
export async function updateProjectTitle(params) {
  return request('/ep/rest/project/updateTitle', { data: { ...params }, method: 'PUT' });
}

// 变更快照编辑项目
export async function update4Projectchange(params) {
  return request('/ep/rest/project/update4change', { data: { ...params }, method: 'POST' });
}

// 获取项目变更详情
export async function getChangeDetail(params) {
  return request('/ep/rest/project/change/detail', { data: { ...params } });
}

// 获取项目变更详情历史
export async function getChangeDetailById(params) {
  return request('/ep/rest/project/change/detailByChangeId', { data: { ...params } });
}

// 恢复变更
export async function cancelProjectChange(params) {
  return request('/ep/rest/project/change/cancel', { data: { ...params }, method: 'POST' });
}

// 进行中删除临时目标
export async function deleteTempObjectiveFromProject(params) {
  return request('/ep/rest/project/objective/deleteTemp', { data: { ...params }, method: 'POST' });
}

// 根据项目id获取项目代号
export async function getProjectCode(projectId) {
  return request(`/ep/rest/project/getProjectCode/${projectId}`);
}

// 根据项目代号获取id
export async function getProjectId(projectCode) {
  return request(`/ep/rest/project/getIdByProjectCode/${projectCode}`);
}

// 项目审批结果页面的获取
export async function getAuditResult(params) {
  return request(`/ep/rest/workflow/apply/audit/result`, { data: { ...params } });
}

// 当前的单据是否有负责人/验证人/报告人不在项目成员中
export async function getPersonInProjectFlag(params) {
  return request(`/ep/rest/project/getIssueRolesInProjectFlag`, { data: { ...params } });
}
