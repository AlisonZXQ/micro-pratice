import moment from "moment";

const getEditTitle = () => {
  return {
    fontSize: "14px",
    fontWeight: "normal",
    position: "relative",
    top: "-1px",
    color: "#475669",
  };
};

const getEditRequirementTitle = () => {
  return {
    fontSize: "14px",
    fontWeight: "normal",
    position: "relative",
    top: "3px",
    color: "#475669",
  };
};

const getEditObjectiveTitle = () => {
  return {
    maxWidth: "45vw",
    fontSize: "14px",
    fontWeight: "normal",
    position: "relative",
    top: "3px",
    color: "#19222E",
  };
};

const processLinkedRequirement = (data, filterObj) => {
  const { subProductIdList, stateList, year, name } = filterObj;
  return data
    .filter(it => !subProductIdList || !subProductIdList.length || (subProductIdList.length && it.subProductVO && it.subProductVO.id && subProductIdList.includes(it.subProductVO.id)))
    .filter(it => !stateList || !stateList.length || (stateList.length && it.state && stateList.includes(it.state)))
    .filter(it => !year || (year && it.expectReleaseTime && moment(it.expectReleaseTime).format('YYYY').includes(year)))
    .filter(it => !name || (name && it.name && it.name.includes(name)));
};

export {
  getEditTitle,
  getEditRequirementTitle,
  getEditObjectiveTitle,
  processLinkedRequirement
};
