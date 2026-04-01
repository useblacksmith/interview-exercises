# Support Engineer Challenge — Written Follow-Up

Thanks for working through the NovaPay support scenario. Please draft your responses to Colin below as if you were sending them as real support ticket replies. We're looking for clear, empathetic, and technically accurate communication.

---

## 1. Initial Response

Colin has just submitted this ticket. You haven't started investigating yet. Draft your first reply.

> Hi,
>
> We migrated to Blacksmith last week following the migration guide and honestly it's been a nightmare. Our CI pipeline is completely broken — jobs aren't running, our deploy keeps failing and timing out, and we can't figure out why. We are based in the US if that helps with anything.
>
> On top of that, our Docker build step is still taking almost 7 minutes which is basically the same as what we were getting on GitHub. We're a large org and we need these build times cut significantly — that was one of the main reasons we switched to Blacksmith in the first place.
>
> A few members of team have tried to set Blacksmith up and ran into similar issues.
>
> Any help would be really appreciated.
>
> Thanks,
> Colin (NovaPay DevOps)

**Your response:**

<!-- Write your initial response to Colin here -->

---

## 2. Runner Label Fix

You've identified that the lint job was using `ubuntu-latest` instead of a Blacksmith runner label, and you've fixed it. Let Colin know what you found and what you changed.

**Your response:**

<!-- Explain what was wrong and what you changed -->

---

## 3. Docker Build Fix

After fixing the runner label, you found the Docker build was crashing with an out-of-memory error. You've fixed this by changing the runner size. Colin follows up:

> Build is way faster now, that's great! But the push step still takes over a minute. And our deploy to production is still completely broken — smoke tests time out every time.

**Your response:**

<!-- Explain what you fixed, acknowledge the remaining issues, and set expectations -->

---

## 4. Cold Cache Explanation

Colin pushes back on the Docker build speed:

> Actually wait — we re-ran the pipeline and the first Docker build after your changes was still around 6 minutes. Are you sure this caching thing is actually working? This doesn't seem any different from what we had on GitHub.

**Your response:**

<!-- Explain what Colin is seeing and what to expect going forward -->

---

## 5. Region Mismatch Fix

You've identified that the Blacksmith runners were configured in `eu-central` while NovaPay's AWS infrastructure is in `us-west-2`, causing cross-region latency. You've fixed the region in both workflow files. Colin follows up:

> Deploy is working now, thank you! But we're also seeing 2 test failures that always passed on GitHub. Something about a config parser? Our tests haven't changed at all.

**Your response:**

<!-- Explain what you fixed for the deploy issue, and address the new test failures -->

---

## 6. Test Failures & Escalation

You've investigated the test failures and identified that they're caused by a difference in grep behavior between Ubuntu 24.04 (Blacksmith) and Ubuntu 22.04 (GitHub Actions). This is not something the customer can fix — it needs to be escalated to the Blacksmith engineering team. Draft your response covering the workaround and next steps.

**Your response:**

<!-- Explain the root cause, any workaround, and what happens next -->

---

## 7. Final Summary

Draft a closing message to Colin summarizing the full investigation. This should be something Colin can share with his team and reference later. Cover what was found, what was changed, and any outstanding items.

**Your response:**

<!-- Write your full resolution summary here -->
