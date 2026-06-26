<?php $__env->startSection('body'); ?>
    <div class="container mt-xl" id="search-system">

        <div class="grid right-focus reverse-collapse gap-xl">
            <div>
                <div>
                    <h5><?php echo e(trans('entities.search_advanced')); ?></h5>

                    <?php
                        $filterMap = $options->filters->nonNegated()->toValueMap();
                    ?>
                    <form method="get" action="<?php echo e(url('/search')); ?>">
                        <h6><?php echo e(trans('entities.search_terms')); ?></h6>
                        <input type="text" name="search" value="<?php echo e(implode(' ', $options->searches->toValueArray())); ?>">

                        <h6><?php echo e(trans('entities.search_content_type')); ?></h6>
                        <div class="form-group">

                            <?php
                            $types = explode('|', $filterMap['type'] ?? '');
                            $hasTypes = $types[0] !== '';
                            ?>
                            <?php echo $__themeViews->handleViewInclude('search.parts.type-filter', ['checked' => !$hasTypes || in_array('page', $types), 'entity' => 'page', 'transKey' => 'page'], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
                            <?php echo $__themeViews->handleViewInclude('search.parts.type-filter', ['checked' => !$hasTypes || in_array('chapter', $types), 'entity' => 'chapter', 'transKey' => 'chapter'], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
                            <br>
                            <?php echo $__themeViews->handleViewInclude('search.parts.type-filter', ['checked' => !$hasTypes || in_array('book', $types), 'entity' => 'book', 'transKey' => 'book'], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
                            <?php echo $__themeViews->handleViewInclude('search.parts.type-filter', ['checked' => !$hasTypes || in_array('bookshelf', $types), 'entity' => 'bookshelf', 'transKey' => 'shelf'], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
                        </div>

                        <h6><?php echo e(trans('entities.search_exact_matches')); ?></h6>
                        <?php echo $__themeViews->handleViewInclude('search.parts.term-list', ['type' => 'exact', 'currentList' => $options->exacts->nonNegated()->toValueArray()], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>

                        <h6><?php echo e(trans('entities.search_tags')); ?></h6>
                        <?php echo $__themeViews->handleViewInclude('search.parts.term-list', ['type' => 'tags', 'currentList' => $options->tags->nonNegated()->toValueArray()], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>

                        <?php if(!user()->isGuest()): ?>
                            <h6><?php echo e(trans('entities.search_options')); ?></h6>

                            <?php $__env->startComponent('search.parts.boolean-filter', ['filters' => $filterMap, 'name' => 'viewed_by_me', 'value' => null]); ?>
                                <?php echo e(trans('entities.search_viewed_by_me')); ?>

                            <?php echo $__env->renderComponent(); ?>
                            <?php $__env->startComponent('search.parts.boolean-filter', ['filters' => $filterMap, 'name' => 'not_viewed_by_me', 'value' => null]); ?>
                                <?php echo e(trans('entities.search_not_viewed_by_me')); ?>

                            <?php echo $__env->renderComponent(); ?>
                            <?php $__env->startComponent('search.parts.boolean-filter', ['filters' => $filterMap, 'name' => 'is_restricted', 'value' => null]); ?>
                                <?php echo e(trans('entities.search_permissions_set')); ?>

                            <?php echo $__env->renderComponent(); ?>
                            <?php $__env->startComponent('search.parts.boolean-filter', ['filters' => $filterMap, 'name' => 'created_by', 'value' => 'me']); ?>
                                <?php echo e(trans('entities.search_created_by_me')); ?>

                            <?php echo $__env->renderComponent(); ?>
                            <?php $__env->startComponent('search.parts.boolean-filter', ['filters' => $filterMap, 'name' => 'updated_by', 'value' => 'me']); ?>
                                <?php echo e(trans('entities.search_updated_by_me')); ?>

                            <?php echo $__env->renderComponent(); ?>
                            <?php $__env->startComponent('search.parts.boolean-filter', ['filters' => $filterMap, 'name' => 'owned_by', 'value' => 'me']); ?>
                                <?php echo e(trans('entities.search_owned_by_me')); ?>

                            <?php echo $__env->renderComponent(); ?>
                        <?php endif; ?>

                        <h6><?php echo e(trans('entities.search_date_options')); ?></h6>
                        <?php echo $__themeViews->handleViewInclude('search.parts.date-filter', ['name' => 'updated_after', 'filters' => $filterMap], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
                        <?php echo $__themeViews->handleViewInclude('search.parts.date-filter', ['name' => 'updated_before', 'filters' => $filterMap], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
                        <?php echo $__themeViews->handleViewInclude('search.parts.date-filter', ['name' => 'created_after', 'filters' => $filterMap], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
                        <?php echo $__themeViews->handleViewInclude('search.parts.date-filter', ['name' => 'created_before', 'filters' => $filterMap], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>

                        <input type="hidden" name="extras" value="<?php echo e($options->getAdditionalOptionsString()); ?>">
                        <button type="submit" class="button"><?php echo e(trans('entities.search_update')); ?></button>
                    </form>

                </div>
            </div>
            <div>
                <div class="card content-wrap">
                    <h1 class="list-heading"><?php echo e(trans('entities.search_results')); ?></h1>

                    <form action="<?php echo e(url('/search')); ?>" method="GET" class="search-box flexible hide-over-l">
                        <input value="<?php echo e($searchTerm); ?>" type="text" name="term"
                               placeholder="<?php echo e(trans('common.search')); ?>">
                        <button type="submit"
                                aria-label="<?php echo e(trans('common.search')); ?>"
                                tabindex="-1"><?php echo (new \BookStack\Util\SvgIcon('search'))->toHtml(); ?></button>
                    </form>

                    <h6 class="text-muted"><?php echo e(trans_choice('entities.search_total_results_found', $totalResults, ['count' => $totalResults])); ?></h6>
                    <div class="book-contents">
                        <?php echo $__themeViews->handleViewInclude('entities.list', ['entities' => $entities, 'showPath' => true, 'showTags' => true], array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1])); ?>
                    </div>

                    <?php echo e($paginator->render()); ?>

                </div>
            </div>
        </div>

    </div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.simple', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /app/www/resources/views/search/all.blade.php ENDPATH**/ ?>