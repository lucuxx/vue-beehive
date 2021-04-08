/**
 * @description 路由拦截状态管理，目前两种模式：all模式与intelligence模式，其中partialRoutes是菜单暂未使用
 */
import { asyncRoutes, constantRoutes } from '@/router';
import { getRouterList } from '@/api/router';
import { filterAllRoutes, filterAsyncRoutes, listToTree } from '@/utils/handleRoutes';

const state = {
  routes: [],
  partialRoutes: [],
  accessRoutesTree: [],
  navIndex: 0,
  noNav: false,
};
const getters = {
  routes: state => state.routes,
  partialRoutes: state => state.partialRoutes,
  accessRoutesTree: state => state.accessRoutesTree,
  accessRoutesTreeNoHidden: state => state.accessRoutesTree?.filter(item => !item.hidden) || [],
  navIndex: state => state.navIndex,
  noNav: state => state.noNav,
  currentNav: state => {
    const accessRoutesTreeNoHidden = state.accessRoutesTree?.filter(item => !item.hidden) || [];
    return accessRoutesTreeNoHidden.find((item, index) => index === state.navIndex) || [];
  },
};
const mutations = {
  setRoutes(state, routes) {
    state.routes = constantRoutes.concat(routes);
  },
  setAllRoutes(state, routes) {
    state.routes = constantRoutes.concat(routes);
  },
  setPartialRoutes(state, routes) {
    state.partialRoutes = constantRoutes.concat(routes);
  },
  setAccessRoutesTree(state, accessRoutesTree) {
    state.accessRoutesTree = accessRoutesTree;
  },
  setNavIndex(state, navIndex) {
    state.navIndex = navIndex;
  },
  setNoNav(state, noNav) {
    state.noNav = noNav;
  },
};
const actions = {
  async setRoutes({ commit }, permissions) {
    let accessedRoutes = [];
    if (permissions.includes('admin')) {
      accessedRoutes = asyncRoutes;
    } else {
      accessedRoutes = await filterAsyncRoutes(asyncRoutes, permissions);
    }
    commit('setRoutes', accessedRoutes);
    return accessedRoutes;
  },
  async setAllRoutes({ commit }) {
    let { data } = await getRouterList();
    data.push({ path: '*', redirect: '/404', hidden: true });
    let accessRoutes_tree = [];
    listToTree(data, accessRoutes_tree, 0);
    commit('setAccessRoutesTree', accessRoutes_tree);
    let accessRoutes = filterAllRoutes(accessRoutes_tree);
    accessRoutes.push({
      path: '*',
      redirect: '/404',
      hidden: true,
    });
    commit('setAllRoutes', accessRoutes);
    return accessRoutes;
  },
  setPartialRoutes({ commit }, accessRoutes) {
    commit('setPartialRoutes', accessRoutes);
    return accessRoutes;
  },
};
export default { state, getters, mutations, actions };
