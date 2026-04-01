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

## 2. Technical Explanation

You've fixed the Docker build issue (it's now using a larger runner and Blacksmith's caching). Colin follows up:

> Actually wait — we re-ran the pipeline and the first Docker build after your changes was still around 6 minutes. Are you sure this caching thing is actually working? This doesn't seem any different from what we had on GitHub.

**Your response:**

<!-- Explain what Colin is seeing and what to expect going forward -->

---

## 3. Resolution Summary

The investigation is complete. Draft a follow-up message to Colin summarizing everything you found, what was changed, and any outstanding items. Write this as you would a real support ticket reply — it should be something Colin can share with his team.

**Your response:**

<!-- Write your full resolution summary here -->
