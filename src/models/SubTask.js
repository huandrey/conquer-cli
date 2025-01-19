export class SubTask extends Task {
  constructor(props) {
    super(props);
    if (!props.parentId) {
      throw new Error('SubTask must have a parentId');
    }
  }
}
