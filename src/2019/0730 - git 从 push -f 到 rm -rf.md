## git 从 push -f 到 rm -rf

### 查看单个文件的变更记录
```bash
# 查看 filename 相关的 commit
git log filename

# 查看 filename 每次 commit 的 diff
git log -p filename

# 查看 filename 某次提交的 diff
git show hash_xxx filename
```

### 看看到底是谁写的 bug
```bash
# 查看 filename 每一行的更改记录
git blame filename
```