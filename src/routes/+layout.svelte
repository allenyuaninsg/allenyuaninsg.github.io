<script lang="ts">
    import "../app.css";

    let { children } = $props();
</script>

<div class="invisible">
    <div class="grid-cols-1"></div>
    <div class="grid-cols-2"></div>
    <div class="grid-cols-3"></div>
    <div class="grid-cols-4"></div>
    <div class="grid-cols-5"></div>
    <div class="grid-cols-6"></div>
</div>

<div>
    <ul class="menu menu-horizontal rounded-box">
        <li><a href="/">主页</a></li>
        <li><a href="/schulte">舒尔特方格</a></li>
        <li><a href="/sudoku">数独</a></li>
        <li><a href="/flappybird">flappybird</a></li>
        <li><a href="/flight">flight</a></li>
        <li><a href="/arkanoid">arkanoid</a></li>
    </ul>
</div>
<div class="divider"></div>
{@render children()}
